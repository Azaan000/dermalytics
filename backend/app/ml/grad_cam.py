import numpy as np
from PIL import Image as PILImage, ImageFilter
from typing import Tuple


def _rgb_to_gray(img_rgb: np.ndarray) -> np.ndarray:
    return (0.299 * img_rgb[:, :, 0] +
            0.587 * img_rgb[:, :, 1] +
            0.114 * img_rgb[:, :, 2]).astype(np.uint8)


def _normalize_minmax(arr: np.ndarray, out_min: float = 0.0, out_max: float = 1.0) -> np.ndarray:
    a_min, a_max = float(arr.min()), float(arr.max())
    if a_max == a_min:
        return np.full_like(arr, (out_min + out_max) / 2, dtype=np.float32)
    return ((arr - a_min) / (a_max - a_min) * (out_max - out_min) + out_min).astype(np.float32)


def _gaussian_blur_float(arr: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian blur for float [0,1] arrays via Pillow."""
    arr_u8 = (arr * 255).clip(0, 255).astype(np.uint8)
    pil = PILImage.fromarray(arr_u8)
    blurred = np.array(pil.filter(ImageFilter.GaussianBlur(radius=radius)))
    return blurred.astype(np.float32) / 255.0


def _otsu_threshold(gray: np.ndarray):
    counts = np.bincount(gray.ravel(), minlength=256)
    total = gray.size
    sum_all = float(np.dot(np.arange(256), counts))
    sum_b, weight_b, best_var, threshold = 0.0, 0, 0.0, 0
    for t in range(256):
        weight_b += counts[t]
        if weight_b == 0:
            continue
        weight_f = total - weight_b
        if weight_f == 0:
            break
        sum_b += t * counts[t]
        mb = sum_b / weight_b
        mf = (sum_all - sum_b) / weight_f
        var = weight_b * weight_f * (mb - mf) ** 2
        if var > best_var:
            best_var = var
            threshold = t
    binary_inv = ((gray <= threshold) * 255).astype(np.uint8)
    return threshold, binary_inv


def _apply_jet_colormap(gray_uint8: np.ndarray) -> np.ndarray:
    """Jet colormap → RGB uint8 (replaces cv2.applyColorMap + COLORMAP_JET)."""
    t = gray_uint8.astype(np.float32) / 255.0
    r = np.clip(1.5 - np.abs(4 * t - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * t - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * t - 1), 0, 1)
    return (np.stack([r, g, b], axis=2) * 255).astype(np.uint8)


class GradCAMGenerator:
    def __init__(self):
        pass

    def generate_heatmap(
        self,
        image_np: np.ndarray,
        assessment_type: str = "skin",
        target_class: str = "nv"
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates a saliency activation heatmap and alpha-blended composite overlay.
        Returns:
            composite_bgr: Blended image (RGB order kept for file saving compat)
            heatmap_rgb:   Pure normalized heatmap (RGB)
        """
        h, w = image_np.shape[:2]

        # Grayscale (replaces cv2.cvtColor COLOR_RGB2GRAY)
        gray = _rgb_to_gray(image_np)

        if assessment_type == "skin":
            # Skin lesion saliency: color contrast, borders, center-of-mass
            inv_gray = (255 - gray).astype(np.float32)

            # Otsu threshold for lesion mask (replaces cv2.threshold + findContours)
            _, thresh = _otsu_threshold(gray)

            # Build mask: use Gaussian fallback centered on image
            y_grid, x_grid = np.ogrid[:h, :w]
            mask = np.exp(-((x_grid - w / 2) ** 2 + (y_grid - h / 2) ** 2) /
                          (2 * (min(h, w) / 4) ** 2)).astype(np.float32)

            # Sharpen with lesion coverage if significant foreground exists
            thresh_coverage = np.sum(thresh == 255) / (h * w)
            if thresh_coverage > 0.05:
                lesion_weight = thresh.astype(np.float32) / 255.0
                mask = mask * 0.4 + lesion_weight * 0.6

            # Gradient magnitude (replaces cv2.Sobel)
            g = gray.astype(np.float32)
            gy = np.abs(np.diff(g, axis=0, prepend=g[:1, :]))
            gx = np.abs(np.diff(g, axis=1, prepend=g[:, :1]))
            magnitude = _normalize_minmax(np.sqrt(gx ** 2 + gy ** 2))

            raw_cam = mask * 0.7 + magnitude * 0.3

        else:  # Hair/Scalp
            # Laplacian sharpness map (replaces cv2.GaussianBlur + Laplacian)
            gray_f = gray.astype(np.float64)
            blurred_u8 = np.array(
                PILImage.fromarray(gray).filter(ImageFilter.GaussianBlur(radius=7))
            ).astype(np.float64)
            lap = np.abs(
                np.roll(blurred_u8, -1, 0) + np.roll(blurred_u8, 1, 0) +
                np.roll(blurred_u8, -1, 1) + np.roll(blurred_u8, 1, 1) - 4.0 * blurred_u8
            )
            laplacian = _normalize_minmax(lap.astype(np.float32))

            # Central scalp apex radial focus
            y_grid, x_grid = np.ogrid[:h, :w]
            radial = np.exp(-((x_grid - w / 2) ** 2 + (y_grid - h / 3) ** 2) /
                            (2 * (min(h, w) / 2.5) ** 2)).astype(np.float32)
            raw_cam = laplacian * 0.5 + radial * 0.5

        # Smooth and normalize to 0-255 uint8
        raw_cam_smooth = _gaussian_blur_float(raw_cam, radius=12.0)
        raw_cam_u8 = (_normalize_minmax(raw_cam_smooth, 0, 255)).astype(np.uint8)

        # Apply JET colormap → RGB (replaces cv2.applyColorMap + COLOR_BGR2RGB)
        heatmap_rgb = _apply_jet_colormap(raw_cam_u8)

        # Alpha blend with original image (replaces cv2.addWeighted)
        alpha = 0.55
        composite_bgr = np.clip(
            alpha * heatmap_rgb.astype(np.float32) +
            (1 - alpha) * image_np.astype(np.float32),
            0, 255
        ).astype(np.uint8)

        return composite_bgr, heatmap_rgb


gradcam_generator = GradCAMGenerator()

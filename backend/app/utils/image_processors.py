import io
import numpy as np
from PIL import Image, ImageOps, ImageFilter
from typing import Tuple
from app.core.exceptions import ValidationException


def _rgb_to_gray(img_rgb: np.ndarray) -> np.ndarray:
    """RGB → grayscale using luminosity weights (matches cv2.COLOR_RGB2GRAY)."""
    return (0.299 * img_rgb[:, :, 0] +
            0.587 * img_rgb[:, :, 1] +
            0.114 * img_rgb[:, :, 2]).astype(np.uint8)


def _laplacian_variance(gray: np.ndarray) -> float:
    """Sharpness score via numpy Laplacian (replaces cv2.Laplacian)."""
    g = gray.astype(np.float64)
    lap = (np.roll(g, -1, 0) + np.roll(g, 1, 0) +
           np.roll(g, -1, 1) + np.roll(g, 1, 1) - 4.0 * g)
    return float(lap.var())


def validate_and_load_image(file_bytes: bytes) -> Tuple[np.ndarray, Image.Image]:
    """
    Validates image bytes, strips EXIF metadata for privacy, and returns
    (numpy_rgb_array, PIL_Image).
    """
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        pil_img = pil_img.convert("RGB")
    except Exception as e:
        raise ValidationException(
            "Invalid image file format or corrupt data",
            code="VAL_2002",
            details={"error": str(e)}
        )

    w, h = pil_img.size
    if w < 200 or h < 200:
        raise ValidationException(
            "Image dimensions too small. Minimum resolution is 200x200 pixels.",
            code="VAL_2004",
            details={"width": w, "height": h}
        )

    img_np = np.array(pil_img)
    return img_np, pil_img


def create_thumbnail(pil_img: Image.Image, size: Tuple[int, int] = (200, 200)) -> Image.Image:
    thumb = pil_img.copy()
    thumb.thumbnail(size, Image.Resampling.LANCZOS)
    return thumb


def calculate_image_quality(img_np: np.ndarray) -> float:
    """
    Calculates sharpness and quality score using Laplacian variance.
    """
    gray = _rgb_to_gray(img_np)
    variance = _laplacian_variance(gray)
    score = min(1.0, max(0.1, variance / 500.0))
    return round(float(score), 2)

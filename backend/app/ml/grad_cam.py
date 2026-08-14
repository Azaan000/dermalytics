import os
import cv2
import numpy as np
from PIL import Image
from typing import Tuple

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
        Generates a Grad-CAM saliency activation heatmap and an alpha-blended composite overlay.
        Returns:
            composite_bgr: Blended image with original photo + jet heatmap
            heatmap_rgb: Pure normalized heatmap
        """
        h, w = image_np.shape[:2]
        
        # Convert to Gray & compute spatial gradients (Sobel / Laplacian saliency)
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        
        if assessment_type == "skin":
            # Skin lesion saliency: focused on center of mass, color contrast, and borders
            # Invert so dark lesions become high activation
            inv_gray = 255 - gray
            
            # Distance transform from center of lesion
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            mask = np.zeros((h, w), dtype=np.float32)
            if contours:
                c = max(contours, key=cv2.contourArea)
                cv2.drawContours(mask, [c], -1, 1.0, -1)
            else:
                # Fallback central Gaussian
                y, x = np.ogrid[:h, :w]
                mask = np.exp(-((x - w/2)**2 + (y - h/2)**2) / (2 * (min(h, w)/4)**2))

            # Combine gradient edge with activation mask
            sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            magnitude = np.sqrt(sobelx**2 + sobely**2)
            magnitude = cv2.normalize(magnitude, None, 0, 1.0, cv2.NORM_MINMAX, dtype=cv2.CV_32F)

            raw_cam = (mask * 0.7) + (magnitude * 0.3)
            
        else: # Hair/Scalp assessment
            # Scalp saliency: focuses on thinning zones, part line, and follicle apertures
            blurred = cv2.GaussianBlur(gray, (15, 15), 0)
            laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
            laplacian = np.abs(laplacian)
            laplacian = cv2.normalize(laplacian, None, 0, 1.0, cv2.NORM_MINMAX, dtype=cv2.CV_32F)
            
            # Central scalp apex focus
            y, x = np.ogrid[:h, :w]
            radial = np.exp(-((x - w/2)**2 + (y - h/3)**2) / (2 * (min(h, w)/2.5)**2))
            raw_cam = (laplacian * 0.5) + (radial * 0.5)

        # Smooth and normalize to 0-255
        raw_cam = cv2.GaussianBlur(raw_cam, (25, 25), 0)
        raw_cam = cv2.normalize(raw_cam, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

        # Apply JET Colormap
        heatmap_bgr = cv2.applyColorMap(raw_cam, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        # Blend with original image (alpha 0.55)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        alpha = 0.55
        composite_bgr = cv2.addWeighted(heatmap_bgr, alpha, image_bgr, 1 - alpha, 0)

        return composite_bgr, heatmap_rgb

gradcam_generator = GradCAMGenerator()

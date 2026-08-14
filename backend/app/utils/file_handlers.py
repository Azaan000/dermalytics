import os
import uuid
import cv2
import numpy as np
from PIL import Image
from app.core.config import settings

def save_assessment_files(
    image_pil: Image.Image,
    thumbnail_pil: Image.Image,
    composite_bgr: np.ndarray,
    assessment_id: str
) -> dict:
    """
    Saves original image, thumbnail, and Grad-CAM composite image to disk.
    Returns relative URL paths.
    """
    assessments_dir = os.path.join(settings.UPLOAD_DIR, "assessments")
    thumbs_dir = os.path.join(settings.UPLOAD_DIR, "thumbnails")
    gradcam_dir = os.path.join(settings.UPLOAD_DIR, "gradcam")

    os.makedirs(assessments_dir, exist_ok=True)
    os.makedirs(thumbs_dir, exist_ok=True)
    os.makedirs(gradcam_dir, exist_ok=True)

    image_filename = f"{assessment_id}.jpg"
    thumb_filename = f"thumb_{assessment_id}.jpg"
    gradcam_filename = f"gradcam_{assessment_id}.jpg"

    image_path = os.path.join(assessments_dir, image_filename)
    thumb_path = os.path.join(thumbs_dir, thumb_filename)
    gradcam_path = os.path.join(gradcam_dir, gradcam_filename)

    # Save PIL images
    image_pil.save(image_path, format="JPEG", quality=90)
    thumbnail_pil.save(thumb_path, format="JPEG", quality=85)

    # Save OpenCV image
    cv2.imwrite(gradcam_path, composite_bgr)

    return {
        "image_url": f"/uploads/assessments/{image_filename}",
        "thumbnail_url": f"/uploads/thumbnails/{thumb_filename}",
        "grad_cam_url": f"/uploads/gradcam/{gradcam_filename}"
    }

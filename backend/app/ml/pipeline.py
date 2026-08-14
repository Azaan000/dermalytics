import time
import os
import cv2
import numpy as np
from typing import Dict, Any, Tuple
from app.ml.skin_classifier import skin_classifier
from app.ml.hair_analyzer import hair_analyzer
from app.ml.grad_cam import gradcam_generator

class MLPipeline:
    def process_skin_assessment(self, image_np: np.ndarray) -> Tuple[Dict[str, Any], np.ndarray, np.ndarray, int]:
        start_time = time.time()
        
        # 1. Run 7-class prediction
        prediction = skin_classifier.predict(image_np)
        
        # 2. Generate Grad-CAM heatmaps
        composite_bgr, heatmap_rgb = gradcam_generator.generate_heatmap(
            image_np,
            assessment_type="skin",
            target_class=prediction["code"]
        )
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        return prediction, composite_bgr, heatmap_rgb, elapsed_ms

    def process_hair_assessment(self, image_np: np.ndarray) -> Tuple[Dict[str, Any], np.ndarray, np.ndarray, int]:
        start_time = time.time()
        
        # 1. Run trichology analysis
        prediction = hair_analyzer.analyze(image_np)
        
        # 2. Generate Grad-CAM heatmaps
        composite_bgr, heatmap_rgb = gradcam_generator.generate_heatmap(
            image_np,
            assessment_type="hair"
        )
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        return prediction, composite_bgr, heatmap_rgb, elapsed_ms

ml_pipeline = MLPipeline()

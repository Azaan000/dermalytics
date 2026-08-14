import numpy as np
from app.ml.skin_classifier import skin_classifier
from app.ml.hair_analyzer import hair_analyzer
from app.ml.grad_cam import gradcam_generator

def test_skin_classifier_prediction():
    dummy_img = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
    res = skin_classifier.predict(dummy_img)
    
    assert "class" in res
    assert "confidence" in res
    assert "top_classes" in res
    assert len(res["top_classes"]) == 7
    assert "risk_level" in res
    assert "requires_consultation" in res

def test_hair_analyzer():
    dummy_img = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
    res = hair_analyzer.analyze(dummy_img)
    
    assert "density_score" in res
    assert 0 <= res["density_score"] <= 100
    assert "thinning_stage" in res
    assert "metrics" in res

def test_gradcam_generator():
    dummy_img = np.random.randint(0, 255, (250, 250, 3), dtype=np.uint8)
    composite, heatmap = gradcam_generator.generate_heatmap(dummy_img, assessment_type="skin")
    assert composite.shape == (250, 250, 3)
    assert heatmap.shape == (250, 250, 3)

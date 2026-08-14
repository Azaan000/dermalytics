import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.assessment import Assessment
from app.models.prediction import Prediction
from app.models.audit_log import AuditLog
from app.schemas.assessment import AssessmentHistoryItem, AssessmentHistoryResponse
from app.ml.pipeline import ml_pipeline
from app.utils.image_processors import validate_and_load_image, create_thumbnail, calculate_image_quality
from app.utils.file_handlers import save_assessment_files
from app.core.exceptions import NotFoundException, ValidationException

class AnalysisService:
    def analyze_skin(
        self,
        db: Session,
        user_id: str,
        file_bytes: bytes,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())
        
        # 1. Validate & load image
        img_np, pil_img = validate_and_load_image(file_bytes)
        thumbnail_pil = create_thumbnail(pil_img)
        quality_score = calculate_image_quality(img_np)

        # 2. Run ML Pipeline & Grad-CAM
        prediction_result, composite_bgr, heatmap_rgb, processing_time = ml_pipeline.process_skin_assessment(img_np)

        # 3. Save files
        file_urls = save_assessment_files(pil_img, thumbnail_pil, composite_bgr, assessment_id)

        # 4. Save Database records
        assessment = Assessment(
            id=assessment_id,
            user_id=user_id,
            image_url=file_urls["image_url"],
            thumbnail_url=file_urls["thumbnail_url"],
            assessment_type="skin",
            status="completed",
            image_quality_score=quality_score,
            processing_time_ms=processing_time,
            ip_address=ip,
            user_agent=user_agent
        )
        db.add(assessment)

        prediction = Prediction(
            assessment_id=assessment_id,
            model_version=prediction_result["model_version"],
            model_name=prediction_result["model_name"],
            prediction_type="skin_class",
            result=prediction_result,
            confidence=prediction_result["confidence"],
            top_classes=prediction_result["top_classes"],
            risk_level=prediction_result["risk_level"],
            grad_cam_image_url=file_urls["grad_cam_url"],
            processing_time_ms=processing_time
        )
        db.add(prediction)

        # Audit Log
        audit = AuditLog(
            user_id=user_id,
            action="ASSESSMENT_SKIN",
            resource_type="ASSESSMENT",
            resource_id=assessment_id,
            details={"prediction": prediction_result["class"], "confidence": prediction_result["confidence"]},
            ip_address=ip
        )
        db.add(audit)
        db.commit()

        return {
            "assessment_id": assessment_id,
            "assessment_type": "skin",
            "image_url": file_urls["image_url"],
            "prediction": prediction_result,
            "grad_cam_url": file_urls["grad_cam_url"],
            "processing_time_ms": processing_time,
            "created_at": assessment.created_at.isoformat()
        }

    def analyze_hair(
        self,
        db: Session,
        user_id: str,
        file_bytes: bytes,
        ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        assessment_id = str(uuid.uuid4())

        # 1. Validate & load image
        img_np, pil_img = validate_and_load_image(file_bytes)
        thumbnail_pil = create_thumbnail(pil_img)
        quality_score = calculate_image_quality(img_np)

        # 2. Run ML Pipeline & Grad-CAM
        prediction_result, composite_bgr, heatmap_rgb, processing_time = ml_pipeline.process_hair_assessment(img_np)

        # 3. Save files
        file_urls = save_assessment_files(pil_img, thumbnail_pil, composite_bgr, assessment_id)

        # 4. Save DB records
        assessment = Assessment(
            id=assessment_id,
            user_id=user_id,
            image_url=file_urls["image_url"],
            thumbnail_url=file_urls["thumbnail_url"],
            assessment_type="hair",
            status="completed",
            image_quality_score=quality_score,
            processing_time_ms=processing_time,
            ip_address=ip,
            user_agent=user_agent
        )
        db.add(assessment)

        prediction = Prediction(
            assessment_id=assessment_id,
            model_version=prediction_result["model_version"],
            model_name=prediction_result["model_name"],
            prediction_type="hair_density",
            result=prediction_result,
            confidence=prediction_result["density_score"],
            risk_level=prediction_result["severity"].lower(),
            grad_cam_image_url=file_urls["grad_cam_url"],
            processing_time_ms=processing_time
        )
        db.add(prediction)

        # Audit Log
        audit = AuditLog(
            user_id=user_id,
            action="ASSESSMENT_HAIR",
            resource_type="ASSESSMENT",
            resource_id=assessment_id,
            details={"density_score": prediction_result["density_score"], "stage": prediction_result["thinning_stage"]},
            ip_address=ip
        )
        db.add(audit)
        db.commit()

        return {
            "assessment_id": assessment_id,
            "assessment_type": "hair",
            "image_url": file_urls["image_url"],
            "prediction": prediction_result,
            "grad_cam_url": file_urls["grad_cam_url"],
            "processing_time_ms": processing_time,
            "created_at": assessment.created_at.isoformat()
        }

    def get_assessment(self, db: Session, assessment_id: str, user_id: str) -> Dict[str, Any]:
        assessment = db.query(Assessment).filter(
            Assessment.id == assessment_id,
            Assessment.is_deleted == False
        ).first()

        if not assessment:
            raise NotFoundException("Assessment")

        prediction_data = assessment.prediction.result if assessment.prediction else {}
        grad_cam_url = assessment.prediction.grad_cam_image_url if assessment.prediction else None

        return {
            "assessment_id": assessment.id,
            "assessment_type": assessment.assessment_type,
            "image_url": assessment.image_url,
            "thumbnail_url": assessment.thumbnail_url,
            "status": assessment.status,
            "prediction": prediction_data,
            "grad_cam_url": grad_cam_url,
            "processing_time_ms": assessment.processing_time_ms,
            "created_at": assessment.created_at.isoformat()
        }

    def get_history(
        self,
        db: Session,
        user_id: str,
        page: int = 1,
        limit: int = 20,
        assessment_type: Optional[str] = None
    ) -> Dict[str, Any]:
        query = db.query(Assessment).filter(
            Assessment.user_id == user_id,
            Assessment.is_deleted == False
        )
        if assessment_type and assessment_type in ["skin", "hair"]:
            query = query.filter(Assessment.assessment_type == assessment_type)

        total_items = query.count()
        total_pages = max(1, (total_items + limit - 1) // limit)
        offset = (page - 1) * limit

        assessments = query.order_by(desc(Assessment.created_at)).offset(offset).limit(limit).all()

        items = []
        for a in assessments:
            pred_dict = a.prediction.result if a.prediction else {}
            items.append({
                "id": a.id,
                "type": a.assessment_type,
                "thumbnail": a.thumbnail_url or a.image_url,
                "image_url": a.image_url,
                "prediction": pred_dict,
                "created_at": a.created_at.isoformat(),
                "status": a.status
            })

        return {
            "assessments": items,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_items": total_items,
                "items_per_page": limit
            }
        }

    def compare_assessments(self, db: Session, assessment_ids: List[str], user_id: str) -> List[Dict[str, Any]]:
        assessments = db.query(Assessment).filter(
            Assessment.id.in_(assessment_ids),
            Assessment.is_deleted == False
        ).order_by(Assessment.created_at).all()

        results = []
        for a in assessments:
            results.append({
                "id": a.id,
                "type": a.assessment_type,
                "image_url": a.image_url,
                "grad_cam_url": a.prediction.grad_cam_image_url if a.prediction else None,
                "created_at": a.created_at.isoformat(),
                "prediction": a.prediction.result if a.prediction else {}
            })
        return results

    def delete_assessment(self, db: Session, assessment_id: str, user_id: str) -> bool:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise NotFoundException("Assessment")
        assessment.is_deleted = True
        db.commit()
        return True

analysis_service = AnalysisService()

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, analysis, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis & Inference"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Profile"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Analytics"])

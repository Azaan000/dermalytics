from fastapi import Request
from fastapi.responses import JSONResponse
import logging
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.request_id = str(uuid.uuid4())

class ValidationException(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None, code: str = "VAL_2005"):
        super().__init__(code=code, message=message, status_code=422, details=details)

class AuthenticationException(AppException):
    def __init__(self, message: str = "Invalid credentials", code: str = "AUTH_1001", details: Optional[Dict[str, Any]] = None):
        super().__init__(code=code, message=message, status_code=401, details=details)

class PermissionDeniedException(AppException):
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(code="AUTH_1003", message=message, status_code=403, details=details)

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", details: Optional[Dict[str, Any]] = None):
        super().__init__(code="DB_3001", message=f"{resource} not found", status_code=404, details=details)

class ModelException(AppException):
    def __init__(self, message: str = "AI Model inference failed", code: str = "AI_4001", details: Optional[Dict[str, Any]] = None):
        super().__init__(code=code, message=message, status_code=503, details=details)

class FileProcessingException(AppException):
    def __init__(self, message: str = "File processing failed", code: str = "FILE_5001", details: Optional[Dict[str, Any]] = None):
        super().__init__(code=code, message=message, status_code=400, details=details)

async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details
                },
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "request_id": exc.request_id,
                "path": request.url.path
            }
        )
    
    logging.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "SVR_9001",
                "message": "An unexpected error occurred. Please try again later.",
                "details": {"exception": str(exc)}
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": str(uuid.uuid4()),
            "path": request.url.path
        }
    )

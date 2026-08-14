from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel
from datetime import datetime

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[T] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    error: ErrorDetail
    timestamp: str
    request_id: str
    path: Optional[str] = None

class PaginationMeta(BaseModel):
    current_page: int
    total_pages: int
    total_items: int
    items_per_page: int

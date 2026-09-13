from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    api_key: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = 0.4

class ChatResponse(BaseModel):
    reply: str
    model: str
    is_live_api: bool
    disclaimer: str = "Medical Disclaimer: Dermalytics AI Assistant provides educational information based on its knowledge base. It is not a substitute for clinical medical advice."

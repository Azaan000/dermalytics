from fastapi import APIRouter, Depends, Header
from typing import Optional
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.response import StandardResponse
from app.services.chat_service import chat_service
from app.core.config import settings

router = APIRouter()

@router.post("", response_model=StandardResponse)
async def chat(
    request: ChatRequest,
    x_openrouter_key: Optional[str] = Header(None)
):
    # Support key via header or request body
    key = request.api_key or x_openrouter_key
    
    response = await chat_service.get_response(
        messages=request.messages,
        client_api_key=key,
        client_model=request.model,
        temperature=request.temperature or 0.4
    )

    return StandardResponse(
        status="success",
        data={
            "reply": response.reply,
            "model": response.model,
            "is_live_api": response.is_live_api,
            "disclaimer": response.disclaimer
        }
    )

@router.get("/config", response_model=StandardResponse)
def get_chat_config():
    has_server_key = bool(settings.OPENROUTER_API_KEY)
    return StandardResponse(
        status="success",
        data={
            "has_server_key": has_server_key,
            "default_model": settings.OPENROUTER_MODEL,
            "popular_models": [
                {"id": "google/gemini-2.5-flash-lite-preview-06-17:free", "name": "⭐ Gemini 2.5 Flash Lite (FREE)", "is_free": True},
                {"id": "meta-llama/llama-3.3-70b-instruct:free",          "name": "⭐ Llama 3.3 70B Instruct (FREE)", "is_free": True},
                {"id": "deepseek/deepseek-r1-0528:free",                  "name": "⭐ DeepSeek R1 (FREE)", "is_free": True},
                {"id": "mistralai/mistral-7b-instruct:free",               "name": "⭐ Mistral 7B Instruct (FREE)", "is_free": True},
                {"id": "google/gemini-2.0-flash-001",                     "name": "Gemini 2.0 Flash (Paid)", "is_free": False},
                {"id": "meta-llama/llama-3.3-70b-instruct",               "name": "Llama 3.3 70B Instruct (Paid)", "is_free": False},
                {"id": "anthropic/claude-3.5-sonnet",                     "name": "Claude 3.5 Sonnet — Best Medical Detail (Paid)", "is_free": False},
                {"id": "openai/gpt-4o-mini",                              "name": "GPT-4o Mini (Paid)", "is_free": False},
                {"id": "deepseek/deepseek-chat",                          "name": "DeepSeek V3 (Paid)", "is_free": False},
                {"id": "openrouter/free",                                 "name": "Best Free Model", "is_free": False}
            ]
        }
    )

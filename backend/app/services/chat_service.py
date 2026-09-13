import os
import httpx
import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.schemas.chat import ChatMessage, ChatResponse

logger = logging.getLogger("dermalytics.chat")

class ChatService:
    def __init__(self):
        self.knowledge_text = self._load_knowledge_base()

    def _load_knowledge_base(self) -> str:
        try:
            if os.path.exists(settings.KNOWLEDGE_BASE_PATH):
                with open(settings.KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception as e:
            logger.error(f"Failed to read knowledge.txt: {e}")
        return "Dermalytics knowledge base: Skin lesion classification (HAM10000 7 classes) & Scalp trichology assessment."

    def _build_system_prompt(self) -> str:
        return f"""You are the Dermalytics Clinical AI Assistant — a specialized, knowledgeable, and empathetic expert in dermatology and trichology.
You assist users and clinicians by answering questions about skin lesions, scalp conditions, hair density tracking, and Explainable AI (Grad-CAM).

Use the following certified DERMALYTICS CLINICAL KNOWLEDGE BASE as your authoritative reference:
---
{self.knowledge_text}
---

BEHAVIOR AND GUIDELINES:
1. Ground your answers in the clinical knowledge base (HAM10000 7 classes, ABCDE rules, Norwood-Hamilton & Ludwig hair loss scales, trichoscopy metrics, and Grad-CAM saliency).
2. Explain technical concepts in clear, structured, and reassuring language with helpful bullet points and markdown formatting.
3. When users ask about concerning symptoms (asymmetry, bleeding, rapid growth, sudden patchy hair loss), highlight the triage guidelines and encourage an in-person dermatologist evaluation.
4. When discussing Grad-CAM, explain how the red/warm regions represent highest neural saliency activation and blue regions represent background context.
5. Always maintain a professional, compassionate tone and emphasize that Dermalytics is an assistive screening platform, not a replacement for formal biopsy or medical diagnosis.
"""

    def _sanitize_api_key(self, client_key: Optional[str]) -> Optional[str]:
        raw_key = client_key if (client_key and client_key.strip()) else settings.OPENROUTER_API_KEY
        if not raw_key or not isinstance(raw_key, str):
            return None
        
        cleaned = raw_key.strip().strip('"').strip("'")
        if cleaned.lower().startswith("bearer "):
            cleaned = cleaned[7:].strip()
            
        if not cleaned or cleaned.lower() in ["none", "null", "undefined", "your-api-key", "your-openrouter-key", "your-secret-key-here"]:
            return None
            
        return cleaned

    async def get_response(
        self,
        messages: List[ChatMessage],
        client_api_key: Optional[str] = None,
        client_model: Optional[str] = None,
        temperature: float = 0.4
    ) -> ChatResponse:
        api_key = self._sanitize_api_key(client_api_key)
        model = client_model or settings.OPENROUTER_MODEL or "openrouter/free"

        if not api_key:
            # If no valid key provided, answer immediately from the local knowledge base without making external network calls
            user_last_msg = messages[-1].content if messages else ""
            fallback_reply = self._generate_local_fallback(user_last_msg)
            return ChatResponse(
                reply=fallback_reply,
                model="local-knowledge-base",
                is_live_api=False
            )

        # Build payload for OpenRouter
        system_msg = {"role": "system", "content": self._build_system_prompt()}
        api_messages = [system_msg] + [{"role": m.role, "content": m.content} for m in messages]

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://dermalytics.com",
            "X-Title": "Dermalytics Skin & Hair AI Platform",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": api_messages,
            "temperature": temperature,
            "max_tokens": 1200
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    reply_text = data["choices"][0]["message"]["content"]
                    used_model = data.get("model", model)
                    return ChatResponse(
                        reply=reply_text,
                        model=used_model,
                        is_live_api=True
                    )
                elif response.status_code == 401:
                    logger.warning("OpenRouter API returned 401 Unauthorized (Invalid or expired API Key).")
                    return ChatResponse(
                        reply=(
                            "⚠️ **OpenRouter Authentication Notice (401):**\n\n"
                            "Your OpenRouter API Key was not recognized or is missing. Please check that:\n"
                            "1. You have entered a valid API key starting with `sk-or-v1-...` in the widget settings (⚙️ icon).\n"
                            "2. The key has active credits on your [OpenRouter Dashboard](https://openrouter.ai/settings/keys).\n\n"
                            "---\n"
                            "### 📚 Answering from Local Knowledge Base:\n\n" + self._generate_local_fallback(messages[-1].content)
                        ),
                        model="local-knowledge-fallback",
                        is_live_api=False
                    )
                else:
                    err_body = response.text
                    logger.warning(f"OpenRouter API error {response.status_code}: {err_body}")
                    return ChatResponse(
                        reply=f"⚠️ **OpenRouter API Notice ({response.status_code}):** {response.json().get('error', {}).get('message', 'Unable to reach model.')}\n\n*Falling back to knowledge base:* \n\n" + self._generate_local_fallback(messages[-1].content),
                        model="local-knowledge-fallback",
                        is_live_api=False
                    )
        except Exception as e:
            logger.error(f"Error calling OpenRouter: {e}")
            return ChatResponse(
                reply=f"*(Network connection to OpenRouter failed. Displaying information from local knowledge base)*\n\n" + self._generate_local_fallback(messages[-1].content),
                model="local-knowledge-fallback",
                is_live_api=False
            )

    def _generate_local_fallback(self, query: str) -> str:
        q = query.lower()
        if any(w in q for w in ["melanoma", "cancer", "malignant", "mel"]):
            return (
                "### 🔬 Malignant Melanoma (HAM10000: `mel`)\n"
                "- **Definition:** A high-risk malignant tumor arising from melanocytes.\n"
                "- **Dermoscopic Signs:** Asymmetry in shape/color, atypical pigment network, irregular globules, and blue-white veils.\n"
                "- **Urgency:** **High priority** — requires prompt clinical evaluation and excisional biopsy.\n"
                "- **ABCDE Rule:** Look for Asymmetry, Border irregularity, Color variation, Diameter >6mm, and Evolution over time.\n\n"
                "*Tip: Configure your OpenRouter API key in settings (⚙️) for conversational AI responses.*"
            )
        elif any(w in q for w in ["norwood", "ludwig", "hair loss", "thinning", "alopecia", "density", "scalp"]):
            return (
                "### 💈 Trichology & Hair Density Assessment\n"
                "- **Norwood-Hamilton Scale (Male Pattern):** Ranges from Stage I (normal juvenile hairline) to Stage VII (severe extensive loss).\n"
                "- **Ludwig Scale (Female Pattern):** Stage I (mild part widening), Stage II (moderate diffuse crown rarefaction), Stage III (extensive vertex thinning).\n"
                "- **Density Scoring:** Healthy scalps typically measure between 80–100 with multi-hair follicular units (2–4 hairs/follicle).\n"
                "- **Recommendation:** Capture scans under uniform lighting every 30 days to track treatment response.\n\n"
                "*Tip: Add your OpenRouter API key in settings for custom interactive Q&A!*"
            )
        elif any(w in q for w in ["gradcam", "grad-cam", "heatmap", "explain", "xai"]):
            return (
                "### 🧠 Explainable AI (Grad-CAM) in Dermalytics\n"
                "- **What it is:** Gradient-weighted Class Activation Mapping computes spatial gradients from the final convolutional layer of EfficientNet / MobileNet.\n"
                "- **Heatmap Colors:**\n"
                "  * 🔴 **Red/Orange:** High saliency activation — key lesion margin or follicle cluster that drove the prediction.\n"
                "  * 🟡 **Yellow/Green:** Moderate contextual influence.\n"
                "  * 🔵 **Blue/Purple:** Background non-diagnostic tissue.\n"
                "- **Transparency:** Eliminates the medical 'black box' by highlighting why an image was flagged."
            )
        elif any(w in q for w in ["class", "ham10000", "7", "types"]):
            return (
                "### 🧪 The 7 HAM10000 Skin Lesion Diagnostic Classes\n"
                "1. **Melanocytic Nevus (`nv`):** Common benign mole with uniform pigment network.\n"
                "2. **Melanoma (`mel`):** Malignant high-risk skin cancer with color/shape asymmetry.\n"
                "3. **Basal Cell Carcinoma (`bcc`):** Malignant pearly nodule with arborizing telangiectasias.\n"
                "4. **Actinic Keratosis (`akiec`):** Pre-cancerous rough scaly patch on sun-damaged skin.\n"
                "5. **Benign Keratosis (`bkl`):** Common waxy/scaly age-related seborrheic keratosis.\n"
                "6. **Dermatofibroma (`df`):** Firm benign bump with central white scar.\n"
                "7. **Vascular Lesion (`vasc`):** Benign angioma with red/purple lacunae."
            )
        else:
            return (
                "### 👋 Dermalytics Clinical AI Assistant\n"
                "I am grounded in the **Dermalytics Clinical Knowledge Base** covering:\n"
                "- **Skin Lesions:** HAM10000 7 Diagnostic Classes and ABCDE screening.\n"
                "- **Hair & Scalp Health:** Norwood/Ludwig staging, follicle density scores, sebum, and inflammation.\n"
                "- **Explainable AI:** Grad-CAM saliency interpretations and clinical safety triage.\n\n"
                "💬 *To enable live OpenRouter multi-turn LLM reasoning, click the ⚙️ icon in the top right of this widget and enter your OpenRouter API key (`sk-or-v1-...`)!*"
            )

chat_service = ChatService()

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
        return f"""You are the Dermalytics AI Health Assistant — a friendly, compassionate, and easy-to-understand skin and hair advisor.
Your goal is to help everyday people, patients, families, and doctors understand skin spots, hair thinning, and AI checkup results.

CRITICAL COMMUNICATION RULE:
- ALWAYS EXPLAIN THINGS IN SIMPLE, EASY, EVERYDAY WORDS that anyone can understand (no complicated medical jargon!).
- If you ever use a medical term (like "Melanoma" or "Norwood Stage"), immediately explain what it means in plain English in parentheses (e.g., "Melanoma (a serious skin spot that needs a doctor checkup)").
- Be warm, calming, and reassuring. Never cause unnecessary panic.
- Break down explanations into short, friendly bullet points.

Use the following certified DERMALYTICS CLINICAL KNOWLEDGE BASE as your reference:
---
{self.knowledge_text}
---

KEY TOPICS & HOW TO EXPLAIN THEM SIMPLY:
1. Skin Spots: Explain the 7 types simply (Normal Mole, Serious Melanoma, Treatable Basal Cell Spot, Sun Spot, Harmless Age Spot, Harmless Bump, Blood Vessel Mark).
2. ABCDE Rule: Explain as the 5 signs to check on any mole (Asymmetry = uneven shape, Border = jagged edges, Color = multiple shades, Diameter = bigger than a pencil eraser, Evolution = changing over time).
3. Hair Loss: Explain the scale simply as measuring how much hair has thinned from hairline to crown, and how density score (0-100) measures how thick and full hair is.
4. AI Heatmap (Grad-CAM): Explain that Red/Orange shows where the AI focused its attention most, and Blue is just normal background skin or hair.
5. Always remind users warmly that Dermalytics is an assistive screening tool and seeing a doctor is always the safest, best choice for peace of mind.
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
                "### 🔬 Melanoma (High-Risk Skin Spot)\n"
                "- **What it is in simple words:** A serious type of skin spot that forms from pigment cells. It is critical to catch it early.\n"
                "- **What to look out for (The ABCDE Rule):**\n"
                "  * **A = Uneven Shape:** One half doesn't match the other.\n"
                "  * **B = Ragged Border:** The edges are rough, blurry, or notched.\n"
                "  * **C = Color Changes:** It has different shades of brown, black, red, or white.\n"
                "  * **D = Size:** Larger than a pencil eraser (about 6mm).\n"
                "  * **E = Changing:** Growing, changing color, bleeding, or itching.\n"
                "- **What you should do:** If you notice any of these signs, have a skin doctor (dermatologist) take a quick look in person. Finding it early makes it very easy to cure!\n\n"
                "*Tip: You can set up your OpenRouter API key in settings (⚙️) for live conversational answers.*"
            )
        elif any(w in q for w in ["norwood", "ludwig", "hair loss", "thinning", "alopecia", "density", "scalp"]):
            return (
                "### 💈 Hair & Scalp Health Guide\n"
                "- **How Men's Hair Loss is Measured (Norwood Scale):**\n"
                "  * **Stage 1:** Normal, full hairline.\n"
                "  * **Stage 2–3:** Slight receding at the temples; Stage 3 is where thinning becomes noticeable.\n"
                "  * **Stage 4–5:** Thinning spreading across the top (crown).\n"
                "  * **Stage 6–7:** Most hair on top is thin, leaving hair on the sides and back.\n"
                "- **How Women's Hair Loss is Measured (Ludwig Scale):**\n"
                "  * Measures gradual thinning along the central part line while keeping the front hairline intact.\n"
                "- **Hair Fullness Score (0 to 100):**\n"
                "  * A score of **80 to 100** means great, healthy thickness with multiple hairs growing from each pore.\n"
                "- **Easy Advice:** Take a photo under similar lighting once a month to track your hair's progress over time."
            )
        elif any(w in q for w in ["gradcam", "grad-cam", "heatmap", "explain", "xai"]):
            return (
                "### 🧠 AI Focus Map (See Where the AI Looked)\n"
                "- **What is this colorful map?** It shows you the exact parts of your photo that the AI paid attention to when checking your skin or scalp.\n"
                "- **How to read the colors easily:**\n"
                "  * 🔴 **Red & Orange (Bright Warm Colors):** This is where the AI focused most of its attention (such as the edge of a mole or a thinning hair spot).\n"
                "  * 🟡 **Yellow & Green:** Supporting areas that helped the AI confirm details.\n"
                "  * 🔵 **Blue & Purple:** Just normal, healthy background skin or hair that the AI knew to ignore.\n"
                "- **Why it helps:** You don't have to guess why the AI gave an answer — you can see the exact spot it analyzed!"
            )
        elif any(w in q for w in ["class", "ham10000", "7", "types"]):
            return (
                "### 🧪 The 7 Types of Skin Spots Checked by the AI (in Simple Words)\n"
                "1. **Common Mole (`nv`):** Normal, harmless beauty mark. Completely safe.\n"
                "2. **Melanoma (`mel`):** Serious skin spot that needs a doctor checkup right away.\n"
                "3. **Basal Cell Spot (`bcc`):** Very common, slow-growing skin condition. Very treatable when caught early.\n"
                "4. **Rough Sun Spot (`akiec`):** Dry, scaly patch from years of sun exposure. Good to treat early.\n"
                "5. **Harmless Age Spot (`bkl`):** Normal rough or waxy spot that comes naturally with age.\n"
                "6. **Small Firm Bump (`df`):** Harmless little bump under the skin, often from a bug bite.\n"
                "7. **Red Blood Vessel Dot (`vasc`):** Completely harmless tiny red dot made of tiny blood vessels."
            )
        else:
            return (
                "### 👋 Hello from Dermalytics AI Health Assistant!\n"
                "I am here to explain skin spots and hair health in **simple, easy words** so anyone can understand:\n"
                "- **Skin Spots:** Explaining the 7 types of spots and how to check your moles (ABCDE signs).\n"
                "- **Hair & Scalp:** Explaining hair loss stages, fullness scores (0–100), and simple care habits.\n"
                "- **AI Focus Map (Grad-CAM):** Showing you exactly what the AI noticed in your photo.\n\n"
                "💬 *Feel free to ask any question in your own words, or tap ⚙️ in the top corner to connect your OpenRouter key for conversational chat!*"
            )

chat_service = ChatService()

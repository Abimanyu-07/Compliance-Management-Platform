"""
AI service layer — wraps Google Gemini, OpenAI, Groq, & Anthropic Claude APIs
for the InnovX Compliance Copilot (spec section 19).

Design constraints (from the hackathon brief):
  - The LLM NEVER invents government requirements, portals, deadlines, or
    approval facts. All such facts come from the deterministic engines
    (requirement_engine, risk_engine, recommendation_engine, dependency_engine)
    and are handed to the model as read-only CONTEXT. The model's job is only
    to phrase a natural-language, conversational answer grounded in that
    context and to hold a conversation about it.
  - The app must keep working with zero external AI dependency. If
    no API key is configured, the package is missing,
    or the API call fails/times out for any reason (e.g. 401 invalid key, 429 quota exhausted),
    every function here returns None so callers fall back to the existing deterministic
    templated response. Nothing in the request path ever raises because of
    this module.
  - Supports:
    1. Google Gemini (gemini-3.6-flash) via GEMINI_API_KEY / GOOGLE_API_KEY
    2. OpenAI (gpt-4o-mini, gpt-4o) via OPENAI_API_KEY
    3. Groq (llama-3.3-70b-versatile) via GROQ_API_KEY
    4. Anthropic Claude (claude-sonnet-4-6, claude-3-5-haiku) via ANTHROPIC_API_KEY
"""
import os
import json
import logging
from functools import lru_cache
from typing import Optional, Tuple, Any

logger = logging.getLogger("innovx.ai_service")

MAX_TOKENS = int(os.getenv("COPILOT_MAX_TOKENS", "400"))
REQUEST_TIMEOUT_SECONDS = float(os.getenv("COPILOT_TIMEOUT_SECONDS", "12"))

SYSTEM_PROMPT = """You are the InnovX Compliance Copilot, embedded inside a business-approval \
and licensing compliance platform built for a hackathon prototype (YHACK '26, Problem \
Statement 20).

You help a business owner understand their approval/licensing checklist, required \
documents, application status, dependencies between approvals, risk/readiness, and \
recommended next action.

STRICT GROUNDING RULES — follow these exactly:
1. You are given a CONTEXT block containing the only facts you may state about this \
business, its requirements, documents, applications, dependencies, risk score, and \
recommended next action. Treat CONTEXT as the complete and authoritative source.
2. NEVER invent, guess, or state government requirements, authorities, portal URLs, fees, \
deadlines, or legal facts that are not present in CONTEXT. If the user asks about \
something not covered in CONTEXT, say plainly that this prototype does not have that \
information and suggest checking the official government portal or authority.
3. NEVER claim InnovX submits applications on the business's behalf. Actual submission \
always happens through the relevant official government channel unless an authorized \
API is explicitly noted in CONTEXT.
4. NEVER claim guaranteed approval, guaranteed scheme eligibility, or 100% legal \
compliance. This is a prototype decision-support tool, not legal advice.
5. Keep answers short and conversational: 2-4 sentences, plain language, no headers or \
markdown tables. You may reference the specific next action, document, or approval by \
name when it is in CONTEXT.
6. If CONTEXT shows a clear next-best-action, prioritize mentioning it unless the user's \
question is clearly about something else in CONTEXT (e.g. risk score, where to apply, \
incentives).
"""


def _resolve_model(provider: str, model_override: str) -> str:
    """Resolve model name ensuring provider compatibility."""
    if model_override:
        # Check if the override makes sense for the provider
        if provider == "gemini" and not any(model_override.startswith(p) for p in ("gpt-", "claude-", "llama-")):
            return model_override
        if provider == "openai" and not any(model_override.startswith(p) for p in ("gemini-", "claude-", "llama-")):
            return model_override
        if provider == "anthropic" and not any(model_override.startswith(p) for p in ("gemini-", "gpt-", "llama-")):
            return model_override
        if provider == "groq" and not any(model_override.startswith(p) for p in ("gemini-", "gpt-", "claude-")):
            return model_override

    # Defaults per provider
    if provider == "gemini":
        return os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    if provider == "openai":
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if provider == "anthropic":
        return os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    if provider == "groq":
        return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return "gpt-4o-mini"


def _detect_provider() -> Tuple[Optional[str], Optional[str], str, Optional[str]]:
    """
    Determine (provider, api_key, model, base_url).
    Auto-detects provider based on key format and environment variables.
    """
    provider_override = os.getenv("COPILOT_PROVIDER", "").strip().lower()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    generic_key = os.getenv("AI_API_KEY", "").strip()
    model_override = os.getenv("COPILOT_MODEL", "").strip()

    # Explicit provider override
    if provider_override in ("gemini", "google"):
        key = gemini_key or generic_key or anthropic_key or openai_key
        model = _resolve_model("gemini", model_override)
        return "gemini", key or None, model, "https://generativelanguage.googleapis.com/v1beta/openai/"
    if provider_override == "groq":
        key = groq_key or generic_key or anthropic_key or openai_key
        model = _resolve_model("groq", model_override)
        return "groq", key or None, model, "https://api.groq.com/openai/v1"
    if provider_override == "openai":
        key = openai_key or generic_key or anthropic_key
        model = _resolve_model("openai", model_override)
        return "openai", key or None, model, None
    if provider_override == "anthropic":
        key = anthropic_key or generic_key or openai_key
        model = _resolve_model("anthropic", model_override)
        return "anthropic", key or None, model, None

    # Auto-detection:
    # 1. Gemini key (explicit variable or starts with AQ. / AIzaSy)
    if gemini_key:
        model = _resolve_model("gemini", model_override)
        return "gemini", gemini_key, model, "https://generativelanguage.googleapis.com/v1beta/openai/"

    # 2. Groq key (explicit variable or starts with gsk_)
    if groq_key or (generic_key and generic_key.startswith("gsk_")):
        key = groq_key or generic_key
        model = _resolve_model("groq", model_override)
        return "groq", key, model, "https://api.groq.com/openai/v1"

    # 3. Direct OPENAI_API_KEY
    if openai_key:
        model = _resolve_model("openai", model_override)
        return "openai", openai_key, model, None

    # 4. Key provided in ANTHROPIC_API_KEY
    if anthropic_key:
        if anthropic_key.startswith("sk-ant-"):
            model = _resolve_model("anthropic", model_override)
            return "anthropic", anthropic_key, model, None
        elif anthropic_key.startswith("sk-proj-") or (anthropic_key.startswith("sk-") and not anthropic_key.startswith("sk-ant-")):
            model = _resolve_model("openai", model_override)
            return "openai", anthropic_key, model, None
        elif anthropic_key.startswith("AIzaSy") or anthropic_key.startswith("AQ."):
            model = _resolve_model("gemini", model_override)
            return "gemini", anthropic_key, model, "https://generativelanguage.googleapis.com/v1beta/openai/"
        elif anthropic_key.startswith("gsk_"):
            model = _resolve_model("groq", model_override)
            return "groq", anthropic_key, model, "https://api.groq.com/openai/v1"
        else:
            model = _resolve_model("anthropic", model_override)
            return "anthropic", anthropic_key, model, None

    # 5. Generic AI_API_KEY
    if generic_key:
        if generic_key.startswith("sk-ant-"):
            model = _resolve_model("anthropic", model_override)
            return "anthropic", generic_key, model, None
        elif generic_key.startswith("AIzaSy") or generic_key.startswith("AQ."):
            model = _resolve_model("gemini", model_override)
            return "gemini", generic_key, model, "https://generativelanguage.googleapis.com/v1beta/openai/"
        elif generic_key.startswith("gsk_"):
            model = _resolve_model("groq", model_override)
            return "groq", generic_key, model, "https://api.groq.com/openai/v1"
        else:
            model = _resolve_model("openai", model_override)
            return "openai", generic_key, model, None

    return None, None, "", None


@lru_cache(maxsize=1)
def _get_client_and_info() -> Tuple[Optional[str], Optional[Any], Optional[str]]:
    """
    Lazily construct the AI client.
    Returns (provider, client, model) or (None, None, None) if unavailable.
    """
    provider, api_key, model, base_url = _detect_provider()
    if not provider or not api_key:
        return None, None, None

    if provider in ("openai", "gemini", "groq"):
        try:
            import openai
            kwargs = {"api_key": api_key, "timeout": REQUEST_TIMEOUT_SECONDS}
            if base_url:
                kwargs["base_url"] = base_url
            client = openai.OpenAI(**kwargs)
            return provider, client, model
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"{provider} client initialization failed: {exc}")
            return None, None, None

    elif provider == "anthropic":
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key, timeout=REQUEST_TIMEOUT_SECONDS)
            return "anthropic", client, model
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Anthropic client initialization failed: {exc}")
            return None, None, None

    return None, None, None


def ai_available() -> bool:
    provider, client, _ = _get_client_and_info()
    return client is not None


def get_active_provider_info() -> dict:
    """Return status and provider metadata for debug / health checks."""
    provider, client, model = _get_client_and_info()
    return {
        "available": client is not None,
        "provider": provider,
        "model": model,
    }


def _build_user_turn(context: dict, message: str) -> str:
    return (
        "CONTEXT (authoritative facts about this business — do not contradict or go beyond this):\n"
        f"{json.dumps(context, indent=2, default=str)}\n\n"
        f"USER MESSAGE: {message}"
    )


def generate_copilot_answer(
    context: dict,
    message: str,
    history: Optional[list] = None,
) -> Optional[str]:
    """
    Generate a grounded, conversational answer using Gemini, OpenAI, Groq, or Claude.

    Returns the answer text, or None if the AI layer is unavailable/failed
    (callers must fall back to the deterministic template in that case).
    """
    provider, client, model = _get_client_and_info()
    if client is None:
        return None

    user_content = _build_user_turn(context, message)

    try:
        if provider in ("openai", "gemini", "groq"):
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if history:
                messages.extend(history)
            messages.append({"role": "user", "content": user_content})

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=MAX_TOKENS,
                temperature=0.2,
            )
            choice = response.choices[0]
            answer = getattr(choice.message, "content", None) or ""
            return answer.strip() or None

        elif provider == "anthropic":
            messages = list(history or [])
            messages.append({"role": "user", "content": user_content})

            response = client.messages.create(
                model=model,
                max_tokens=MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=messages,
            )
            parts = [block.text for block in response.content if getattr(block, "type", None) == "text"]
            answer = "\n".join(p.strip() for p in parts if p).strip()
            return answer or None

    except Exception as exc:  # noqa: BLE001 - any API/network/quota failure falls back gracefully
        logger.warning(f"Copilot LLM call failed ({provider}/{model}), falling back to deterministic answer: {exc}")
        return None

    return None


def generate_suggested_actions(context: dict, fallback_actions: list) -> list:
    return fallback_actions

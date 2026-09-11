"""
Tests for the AI-powered copilot path. These mock the AI calls
(ai_service.generate_copilot_answer) so the suite never depends on a real
API key or network access, while still proving the end-to-end
wiring: context building -> AI layer -> response shape -> graceful fallback
on failure.
"""
from app.services import ai_service


def test_copilot_uses_ai_answer_when_available(client, monkeypatch):
    monkeypatch.setattr(ai_service, "ai_available", lambda: True)
    monkeypatch.setattr(
        ai_service,
        "generate_copilot_answer",
        lambda context, message, history=None: "Focus on Pollution Consent next — the Project Report is still missing.",
    )

    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "What should I do next?"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["ai_powered"] is True
    assert "Pollution Consent" in data["answer"]
    # Suggested action routes must still come from deterministic next-best-action data.
    assert isinstance(data["suggested_actions"], list)
    assert len(data["suggested_actions"]) > 0
    assert "next_best_action" in data


def test_copilot_falls_back_when_ai_call_fails(client, monkeypatch):
    monkeypatch.setattr(ai_service, "ai_available", lambda: True)
    monkeypatch.setattr(
        ai_service,
        "generate_copilot_answer",
        lambda context, message, history=None: None,  # simulates API error / timeout
    )

    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "What should our next step be?"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["ai_powered"] is False
    assert "highest-priority action" in data["answer"].lower()


def test_copilot_falls_back_when_ai_not_configured(client, monkeypatch):
    monkeypatch.setattr(ai_service, "ai_available", lambda: False)

    response = client.post(
        "/api/copilot/chat",
        json={"business_id": 1, "message": "What should our next step be?"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["ai_powered"] is False
    assert "highest-priority action" in data["answer"].lower()


def test_ai_service_unavailable_without_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("AI_API_KEY", raising=False)
    ai_service._get_client_and_info.cache_clear()
    assert ai_service.ai_available() is False
    assert ai_service.generate_copilot_answer({"a": 1}, "hello") is None
    ai_service._get_client_and_info.cache_clear()


def test_provider_auto_detection(monkeypatch):
    # Clear all keys first
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.delenv("COPILOT_PROVIDER", raising=False)

    # OpenAI key detection
    monkeypatch.setenv("OPENAI_API_KEY", "sk-proj-test12345")
    ai_service._get_client_and_info.cache_clear()
    provider, key, model, _ = ai_service._detect_provider()
    assert provider == "openai"
    assert key == "sk-proj-test12345"

    # Anthropic key detection
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test12345")
    ai_service._get_client_and_info.cache_clear()
    provider, key, model, _ = ai_service._detect_provider()
    assert provider == "anthropic"
    assert key == "sk-ant-test12345"

    # Gemini key detection
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "AIzaSyTestGeminiKey")
    ai_service._get_client_and_info.cache_clear()
    provider, key, model, _ = ai_service._detect_provider()
    assert provider == "gemini"
    assert key == "AIzaSyTestGeminiKey"

    # Groq key detection
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GROQ_API_KEY", "gsk_test123")
    ai_service._get_client_and_info.cache_clear()
    provider, key, model, _ = ai_service._detect_provider()
    assert provider == "groq"
    assert key == "gsk_test123"

    ai_service._get_client_and_info.cache_clear()

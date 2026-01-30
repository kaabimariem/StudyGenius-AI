from __future__ import annotations

from groq import Groq

from app.core.settings import settings


def get_groq_client() -> Groq:
    key = (settings.groq_api_key or "").strip()
    # Common .env mistakes: wrapping value in quotes
    if (key.startswith('"') and key.endswith('"')) or (key.startswith("'") and key.endswith("'")):
        key = key[1:-1].strip()

    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    return Groq(api_key=key)

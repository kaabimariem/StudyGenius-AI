from __future__ import annotations

import json
from typing import Any

from groq import AuthenticationError, BadRequestError, Groq
from tenacity import RetryError, retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.core.settings import settings
from app.rag.faiss_store import FieldIndex
from app.services.groq_client import get_groq_client
from app.services.prompting import build_generation_prompt, build_repair_prompt
from app.services.schemas import GenerateQuizRequest, QuizResponse


class QuizGenerationError(RuntimeError):
    pass


def _extract_json(text: str) -> str:
    # Groq models sometimes wrap JSON with stray text; try to isolate first {...}.
    t = (text or "").strip()
    if t.startswith("{") and t.endswith("}"):
        return t

    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1 and end > start:
        return t[start : end + 1]
    return t


@retry(
    wait=wait_exponential(min=1, max=8),
    stop=stop_after_attempt(2),
    retry=retry_if_exception(lambda e: not isinstance(e, (BadRequestError, AuthenticationError))),
)
def _call_groq(*, client: Groq, system: str, user: str) -> str:
    resp = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
        top_p=0.9,
        max_tokens=3500,
    )
    return resp.choices[0].message.content or ""


def generate_quiz(req: GenerateQuizRequest) -> QuizResponse:
    try:
        client = get_groq_client()
    except Exception as e:  # noqa: BLE001
        raise QuizGenerationError(
            "GROQ_API_KEY is not set. Put it in backend/.env as GROQ_API_KEY=... or set it in your environment."
        ) from e

    # Retrieve grounding context
    field_index = FieldIndex(field=req.field)
    query = f"Field: {req.field}. Level: {req.level}. Difficulty: {req.difficulty}."
    retrieved, source_docs = field_index.retrieve(query=query, top_k=settings.top_k)

    system, user = build_generation_prompt(
        field=req.field,
        level=req.level,
        difficulty=req.difficulty,
        quiz_type=req.quiz_type,
        include_explanations=req.include_explanations,
        retrieved_chunks=[c.text for c in retrieved],
    )

    try:
        raw = _call_groq(client=client, system=system, user=user)
    except BadRequestError as e:
        raise QuizGenerationError(
            f"Groq rejected the request (often a deprecated GROQ_MODEL). "
            f"Set GROQ_MODEL in backend/.env to a supported LLaMA 3 70B model. Details: {e}"
        ) from e
    except AuthenticationError as e:
        raise QuizGenerationError(
            "Groq authentication failed (invalid GROQ_API_KEY). "
            "Update GROQ_API_KEY in backend/.env (or set it as an environment variable) and restart the server."
        ) from e

    # Strict validation + auto-repair up to 2 times
    last_error = ""
    candidate = _extract_json(raw)

    for _ in range(3):
        try:
            data: Any = json.loads(candidate)
            # Ensure traceability source_docs uses retrieved docs
            if isinstance(data, dict):
                data["source_docs"] = source_docs
            return QuizResponse.model_validate(data)
        except Exception as e:  # noqa: BLE001
            last_error = str(e)
            repair_system, repair_user = build_repair_prompt(
                invalid_json_text=candidate,
                validation_error=last_error,
            )
            try:
                candidate = _extract_json(
                    _call_groq(client=client, system=repair_system, user=repair_user)
                )
            except BadRequestError as e:
                raise QuizGenerationError(
                    f"Groq rejected the request during JSON repair (check GROQ_MODEL). Details: {e}"
                ) from e
            except RetryError as re:
                raise QuizGenerationError(str(re)) from re

    raise QuizGenerationError(f"Invalid LLM JSON after retries: {last_error}")

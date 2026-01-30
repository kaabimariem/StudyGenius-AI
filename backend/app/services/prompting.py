from __future__ import annotations

import json

from app.services.schemas import Difficulty, Level, QuizType


def bloom_levels_for_difficulty(difficulty: Difficulty) -> list[str]:
    if difficulty == "easy":
        return ["Remember", "Understand"]
    if difficulty == "medium":
        return ["Apply"]
    return ["Analyze"]


def difficulty_rules(difficulty: Difficulty) -> str:
    if difficulty == "easy":
        return (
            "Easy rules:\n"
            "- Definition-based questions and direct facts only\n"
            "- No multi-step reasoning chains\n"
            "- Avoid scenarios; keep questions short\n"
        )
    if difficulty == "medium":
        return (
            "Medium rules:\n"
            "- Focus on 'Why' and 'How' questions\n"
            "- Apply concepts to straightforward situations\n"
            "- Simple reasoning allowed (1–2 steps)\n"
        )
    return (
        "Hard rules:\n"
        "- Scenario-based questions\n"
        "- Multi-step reasoning and problem-solving\n"
        "- Ask for diagnosing issues, choosing designs, or troubleshooting\n"
    )


def quiz_type_rules(quiz_type: QuizType) -> str:
    if quiz_type == "mcq":
        return (
            "Quiz type: mcq\n"
            "- Each question MUST include 'options' with exactly 4 choices\n"
            "- 'answer' MUST be exactly one of the 4 options (copy-paste exact)\n"
        )
    if quiz_type == "true_false":
        return (
            "Quiz type: true_false\n"
            "- Do NOT include 'options'\n"
            "- 'answer' MUST be exactly 'True' or 'False'\n"
        )
    return (
        "Quiz type: short_answer\n"
        "- Do NOT include 'options'\n"
        "- 'answer' MUST be a short phrase or 1–2 sentences\n"
    )


def build_generation_prompt(
    *,
    field: str,
    level: Level,
    difficulty: Difficulty,
    quiz_type: QuizType,
    include_explanations: bool,
    retrieved_chunks: list[str],
) -> tuple[str, str]:
    blooms = bloom_levels_for_difficulty(difficulty)

    system = (
        "You are a meticulous educational quiz generator. "
        "You output ONLY valid JSON, no markdown, no code fences, no commentary."
    )

    context = "\n\n---\n\n".join(retrieved_chunks)

    schema_hint = {
        "field": field,
        "level": level,
        "difficulty": difficulty,
        "quiz_type": quiz_type,
        "include_explanations": include_explanations,
        "source_docs": ["doc1.pdf", "doc2.docx"],
        "quiz": [
            {
                "id": 1,
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "answer": "A",
                "cognitive_level": blooms[0],
                "explanation": "...",
            }
        ],
    }

    # Explanation rule: omit the field entirely when not requested.
    explanation_rule = (
        "If include_explanations is false, OMIT the 'explanation' key entirely in each question.\n"
        "If include_explanations is true, include a short 'explanation' for every question.\n"
    )

    user = (
        f"Generate EXACTLY 15 questions for the field '{field}'.\n"
        f"Student level: {level}.\n"
        f"Difficulty: {difficulty}.\n"
        f"Allowed Bloom cognitive levels for this difficulty: {', '.join(blooms)}.\n\n"
        f"{difficulty_rules(difficulty)}\n"
        f"{quiz_type_rules(quiz_type)}\n"
        f"{explanation_rule}\n"
        "Grounding rules:\n"
        "- Use ONLY the provided CONTEXT chunks below.\n"
        "- Do NOT invent facts not supported by the context.\n"
        "- If some detail is missing, ask a more general question supported by context.\n"
        "- Do NOT reference "
        "the existence of chunks or filenames in question text.\n\n"
        "Output rules:\n"
        "- Output MUST be a single JSON object (not an array).\n"
        "- Include the metadata fields exactly: field, level, difficulty, quiz_type, include_explanations, source_docs, quiz.\n"
        "- quiz MUST be a list of EXACTLY 15 items with ids 1..15.\n"
        "- Each item MUST include: id, question, answer, cognitive_level.\n"
        "- cognitive_level MUST be exactly one of the allowed Bloom values.\n"
        "- Ensure JSON is strictly valid (double quotes, no trailing commas).\n\n"
        "Example shape (values are illustrative):\n"
        + json.dumps(schema_hint, ensure_ascii=False)
        + "\n\n"
        "CONTEXT:\n"
        + context
    )

    return system, user


def build_repair_prompt(*, invalid_json_text: str, validation_error: str) -> tuple[str, str]:
    system = (
        "You are a JSON repair tool. "
        "Return ONLY valid JSON. Do not add commentary or code fences."
    )
    user = (
        "Fix the JSON format only. Do not change the content.\n"
        "Constraints:\n"
        "- Preserve all keys/values/meanings unless required to make valid JSON.\n"
        "- Do not add new questions or remove questions.\n"
        "- Ensure 'quiz' has exactly 15 items with ids 1..15.\n\n"
        f"Validation error: {validation_error}\n\n"
        "Invalid JSON to repair:\n"
        + invalid_json_text
    )
    return system, user

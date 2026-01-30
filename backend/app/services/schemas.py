from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


FieldName = str
Level = Literal["beginner", "intermediate", "advanced"]
Difficulty = Literal["easy", "medium", "hard"]
QuizType = Literal["mcq", "true_false", "short_answer"]
CognitiveLevel = Literal["Remember", "Understand", "Apply", "Analyze"]


class GenerateQuizRequest(BaseModel):
    field: FieldName = Field(min_length=1)
    level: Level
    difficulty: Difficulty
    quiz_type: QuizType = "mcq"
    include_explanations: bool = True

    @field_validator("field")
    @classmethod
    def _field_normalize(cls, v: str) -> str:
        return v.strip().lower()


class QuizQuestion(BaseModel):
    id: int = Field(ge=1, le=15)
    question: str = Field(min_length=5)
    answer: str = Field(min_length=1)
    cognitive_level: CognitiveLevel

    options: list[str] | None = None
    explanation: str | None = None

    @model_validator(mode="after")
    def _validate_by_type(self):
        if self.options is not None:
            if len(self.options) != 4:
                raise ValueError("options must have exactly 4 items")
            if len({o.strip().lower() for o in self.options}) != 4:
                raise ValueError("options must be unique")
        return self


class QuizResponse(BaseModel):
    field: FieldName
    level: Level
    difficulty: Difficulty
    quiz_type: QuizType
    include_explanations: bool
    source_docs: list[str]
    quiz: list[QuizQuestion] = Field(min_length=15, max_length=15)

    @model_validator(mode="after")
    def _validate_explanations(self):
        if self.include_explanations:
            missing = [q.id for q in self.quiz if not (q.explanation and q.explanation.strip())]
            if missing:
                raise ValueError(f"Missing explanation for question ids: {missing}")
        else:
            present = [q.id for q in self.quiz if q.explanation is not None]
            if present:
                raise ValueError(
                    "include_explanations=false but explanation field present; omit it entirely"
                )
        return self

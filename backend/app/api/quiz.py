from fastapi import APIRouter, HTTPException

from app.services.quiz_generator import QuizGenerationError, generate_quiz
from app.services.schemas import GenerateQuizRequest, QuizResponse

router = APIRouter(prefix="", tags=["quiz"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/generate-quiz", response_model=QuizResponse)
def generate_quiz_endpoint(req: GenerateQuizRequest) -> QuizResponse:
    try:
        return generate_quiz(req)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except QuizGenerationError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

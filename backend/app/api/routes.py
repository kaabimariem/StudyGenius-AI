from fastapi import APIRouter

from app.api.quiz import router as quiz_router

router = APIRouter()
router.include_router(quiz_router)

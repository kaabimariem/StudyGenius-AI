from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.settings import settings


def create_app() -> FastAPI:
    app = FastAPI(title="AI Quiz Generator", version="0.1.0")
    app.include_router(router)

    # Simple test UI
    app.mount("/static", StaticFiles(directory=str(settings.static_dir), html=True), name="static")
    return app


app = create_app()

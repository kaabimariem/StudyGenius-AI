from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load .env first (local secrets), then fall back to .env.example if present.
    # NOTE: .env.example should not contain real secrets in version control.
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.example"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    docs_root: str = "docs"
    faiss_root: str = "storage/faiss"
    static_root: str = "static"

    embed_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    top_k: int = 5

    chunk_min_tokens: int = 500
    chunk_max_tokens: int = 800
    chunk_overlap_tokens: int = 80

    @property
    def backend_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def docs_dir(self) -> Path:
        return self.backend_root / self.docs_root

    @property
    def faiss_dir(self) -> Path:
        return self.backend_root / self.faiss_root

    @property
    def static_dir(self) -> Path:
        return self.backend_root / self.static_root


settings = Settings()




from __future__ import annotations

import os
from functools import lru_cache

# Avoid importing TensorFlow via transformers on environments where TF/protobuf
# compatibility is flaky or not needed (we use PyTorch backends).
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
os.environ.setdefault("USE_TF", "0")

from sentence_transformers import SentenceTransformer

from app.core.settings import settings


@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    # Cached singleton to avoid reloading model per request
    return SentenceTransformer(settings.embed_model)


def embed_texts(texts: list[str]) -> "list[list[float]]":
    model = get_embedder()
    vectors = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return vectors.tolist()


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]

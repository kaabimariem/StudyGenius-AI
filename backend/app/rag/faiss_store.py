from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

import faiss
import numpy as np

from app.core.settings import settings
from app.rag.corpus import load_field_chunks
from app.rag.embeddings import embed_query, embed_texts
from app.rag.types import Chunk


class FieldIndex:
    def __init__(self, *, field: str):
        self.field = field
        self.index: faiss.Index | None = None
        self.chunks: list[Chunk] = []

    @property
    def field_dir(self) -> Path:
        return settings.faiss_dir / self.field

    @property
    def index_path(self) -> Path:
        return self.field_dir / "index.faiss"

    @property
    def meta_path(self) -> Path:
        return self.field_dir / "chunks.jsonl"

    def exists(self) -> bool:
        return self.index_path.exists() and self.meta_path.exists()

    def build_and_persist(self) -> list[str]:
        chunks, source_docs = load_field_chunks(
            docs_dir=settings.docs_dir,
            field=self.field,
            min_tokens=settings.chunk_min_tokens,
            max_tokens=settings.chunk_max_tokens,
            overlap_tokens=settings.chunk_overlap_tokens,
        )
        if not chunks:
            raise ValueError(f"No supported documents found in docs/{self.field}")

        vectors = np.array(embed_texts([c.text for c in chunks]), dtype="float32")
        dim = vectors.shape[1]

        index = faiss.IndexFlatIP(dim)
        index.add(vectors)

        self.field_dir.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(self.index_path))

        with self.meta_path.open("w", encoding="utf-8") as f:
            for c in chunks:
                f.write(json.dumps(asdict(c), ensure_ascii=False) + "\n")

        self.index = index
        self.chunks = chunks
        return source_docs

    def load(self) -> None:
        if not self.exists():
            raise FileNotFoundError(
                f"Index for field '{self.field}' not found. Build it first (build_indexes)."
            )
        self.index = faiss.read_index(str(self.index_path))

        chunks: list[Chunk] = []
        with self.meta_path.open("r", encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                chunks.append(Chunk(**obj))
        self.chunks = chunks

    def retrieve(self, *, query: str, top_k: int) -> tuple[list[Chunk], list[str]]:
        if self.index is None or not self.chunks:
            self.load()

        q = np.array([embed_query(query)], dtype="float32")
        scores, idxs = self.index.search(q, top_k)

        hits: list[Chunk] = []
        for i in idxs[0].tolist():
            if i < 0:
                continue
            if i >= len(self.chunks):
                continue
            hits.append(self.chunks[i])

        source_docs = sorted({h.source_doc for h in hits})
        return hits, source_docs

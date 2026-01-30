from __future__ import annotations

from pathlib import Path

from app.rag.chunking import chunk_file
from app.rag.loaders import iter_field_files, load_text_from_file
from app.rag.types import Chunk


def load_field_chunks(
    *,
    docs_dir: Path,
    field: str,
    min_tokens: int,
    max_tokens: int,
    overlap_tokens: int,
) -> tuple[list[Chunk], list[str]]:
    field_dir = docs_dir / field
    if not field_dir.exists() or not field_dir.is_dir():
        raise FileNotFoundError(f"Field docs directory not found: {field_dir}")

    chunks: list[Chunk] = []
    source_docs: list[str] = []

    for path in iter_field_files(field_dir):
        text = load_text_from_file(path)
        file_chunks = chunk_file(
            path=path,
            text=text,
            min_tokens=min_tokens,
            max_tokens=max_tokens,
            overlap_tokens=overlap_tokens,
        )
        if file_chunks:
            chunks.extend(file_chunks)
            source_docs.append(path.name)

    # stable order for reproducibility
    chunks.sort(key=lambda c: (c.source_doc, c.chunk_id))
    source_docs = sorted(set(source_docs))
    return chunks, source_docs

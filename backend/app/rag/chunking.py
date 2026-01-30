from __future__ import annotations

import hashlib
from pathlib import Path

from app.rag.tokenization import estimate_tokens, split_by_paragraphs
from app.rag.types import Chunk


def normalize_text(text: str) -> str:
    # Keep minimal normalization to preserve meaning in technical docs
    text = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    lines = [ln.strip() for ln in text.split("\n")]
    # collapse excessive blank lines
    out_lines: list[str] = []
    last_blank = False
    for ln in lines:
        blank = len(ln) == 0
        if blank and last_blank:
            continue
        out_lines.append(ln)
        last_blank = blank
    return "\n".join(out_lines).strip()


def chunk_text(
    *,
    text: str,
    source_doc: str,
    min_tokens: int,
    max_tokens: int,
    overlap_tokens: int,
) -> list[Chunk]:
    norm = normalize_text(text)
    paragraphs = split_by_paragraphs(norm)

    chunks: list[str] = []
    current: list[str] = []
    current_tokens = 0

    def flush():
        nonlocal current, current_tokens
        if not current:
            return
        joined = "\n\n".join(current).strip()
        if joined:
            chunks.append(joined)
        current = []
        current_tokens = 0

    for para in paragraphs:
        t = estimate_tokens(para)

        # If a single paragraph is huge, hard-split by sentences-ish
        if t > max_tokens:
            flush()
            words = para.split()
            buf: list[str] = []
            buf_tokens = 0
            for w in words:
                wt = estimate_tokens(w + " ")
                if buf_tokens + wt > max_tokens and buf:
                    chunks.append(" ".join(buf).strip())
                    # overlap by words (approx) if requested
                    if overlap_tokens > 0:
                        overlap_words = buf[-min(len(buf), max(20, overlap_tokens // 2)) :]
                        buf = overlap_words.copy()
                        buf_tokens = estimate_tokens(" ".join(buf))
                    else:
                        buf = []
                        buf_tokens = 0
                buf.append(w)
                buf_tokens += wt
            if buf:
                chunks.append(" ".join(buf).strip())
            continue

        if current_tokens + t > max_tokens and current:
            flush()

        current.append(para)
        current_tokens += t

        if current_tokens >= min_tokens:
            flush()

    flush()

    out: list[Chunk] = []
    for idx, chunk in enumerate(chunks):
        chunk_id = _stable_chunk_id(source_doc=source_doc, idx=idx, text=chunk)
        out.append(Chunk(text=chunk, source_doc=source_doc, chunk_id=chunk_id))
    return out


def _stable_chunk_id(*, source_doc: str, idx: int, text: str) -> str:
    h = hashlib.sha256()
    h.update(source_doc.encode("utf-8", errors="ignore"))
    h.update(str(idx).encode("utf-8"))
    h.update(text[:2000].encode("utf-8", errors="ignore"))
    return h.hexdigest()[:16]


def chunk_file(
    *,
    path: Path,
    text: str,
    min_tokens: int,
    max_tokens: int,
    overlap_tokens: int,
) -> list[Chunk]:
    return chunk_text(
        text=text,
        source_doc=path.name,
        min_tokens=min_tokens,
        max_tokens=max_tokens,
        overlap_tokens=overlap_tokens,
    )

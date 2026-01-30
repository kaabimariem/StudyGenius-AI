from __future__ import annotations

from collections.abc import Iterable

import tiktoken


def estimate_tokens(text: str, model: str = "cl100k_base") -> int:
    enc = tiktoken.get_encoding(model)
    return len(enc.encode(text or ""))


def split_by_paragraphs(text: str) -> list[str]:
    parts = [p.strip() for p in (text or "").split("\n\n")]
    return [p for p in parts if p]


def join_paragraphs(paragraphs: Iterable[str]) -> str:
    return "\n\n".join([p.strip() for p in paragraphs if p and p.strip()])

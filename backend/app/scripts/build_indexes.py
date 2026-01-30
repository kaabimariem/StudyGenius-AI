from __future__ import annotations

import argparse

from app.core.settings import settings
from app.rag.faiss_store import FieldIndex


def main() -> None:
    parser = argparse.ArgumentParser(description="Build FAISS indexes per field")
    parser.add_argument("--field", default="", help="Optional single field to index")
    args = parser.parse_args()

    settings.faiss_dir.mkdir(parents=True, exist_ok=True)

    if args.field:
        fields = [args.field]
    else:
        # Each subdirectory under docs/ is a field
        fields = [p.name for p in settings.docs_dir.iterdir() if p.is_dir()]

    if not fields:
        raise SystemExit("No fields found under docs/. Create docs/<field>/ folders.")

    for field in sorted(fields):
        idx = FieldIndex(field=field)
        try:
            source_docs = idx.build_and_persist()
            print(f"Built index for '{field}' from {len(source_docs)} source docs")
        except ValueError as e:
            print(f"Skipped '{field}': {e}")


if __name__ == "__main__":
    main()

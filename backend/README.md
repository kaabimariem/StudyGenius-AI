# AI Quiz Generator (Backend)

FastAPI backend that generates *exactly 15* quiz questions using Groq (LLaMA 3 70B) with RAG over local documents.

## Quickstart (Windows PowerShell)

```powershell
cd e:\projet_tekup\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -U pip
pip install -e .
copy .env.example .env
# edit .env and set GROQ_API_KEY

# build FAISS indexes (per field)
python -m app.scripts.build_indexes

# run API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000/static/index.html` to test.

## API

### POST `/generate-quiz`

Request body:

```json
{
	"field": "networking",
	"level": "beginner",
	"difficulty": "easy",
	"quiz_type": "mcq",
	"include_explanations": true
}
```

Returns strict JSON with quiz metadata + exactly 15 questions.

## Notes
- Documents go under `docs/<field>/` (pdf, docx, html, txt).
- FAISS indexes persist under `storage/faiss/<field>/`.
- If Groq reports the model is deprecated, set `GROQ_MODEL` in `.env` to a supported LLaMA 3 70B model.

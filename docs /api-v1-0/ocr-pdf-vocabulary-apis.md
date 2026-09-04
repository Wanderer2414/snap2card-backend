# OCR and PDF Vocabulary APIs

This document lists the APIs added on `dev_v2` for OCR/PDF-based vocabulary generation.

Base URL: `/snap2card/api/v1.0`

## Endpoints

| Method | Path | Auth | Endpoint name |
| ------ | ---- | ---- | ------------- |
| POST | `/vocabulary/from-text` | Bearer token | `vocabulary-from-text` |
| POST | `/vocabulary/from-pdf` | Bearer token | `vocabulary-from-pdf` |

## `POST /vocabulary/from-text`

Used by the Android scan flow after on-device OCR extracts text from a camera/gallery image.

Request body:

```json
{
  "text": "Climate change can exacerbate existing inequalities.",
  "level": "B1",
  "count": 20,
  "includePhrases": true,
  "sourceType": "scan"
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "source": { "type": "scan" },
    "cards": [
      {
        "term": "exacerbate",
        "definition": "To make a problem or bad situation worse.",
        "translation": "làm trầm trọng thêm",
        "partOfSpeech": "verb",
        "example": "Pollution can exacerbate health problems.",
        "sourceSentence": "Climate change can exacerbate existing inequalities.",
        "difficulty": "B1"
      }
    ]
  }
}
```

Validation:

- `text` must be a non-empty string.
- `level` defaults to `B1` and must be one of `A1`, `A2`, `B1`, `B2`, `C1`, `C2`.
- `count` defaults to `20` and must be an integer from `1` to `50`.
- `includePhrases` defaults to `true` and must be a boolean.
- `sourceType` defaults to `scan` and must be `scan` or `pdf`.

## `POST /vocabulary/from-pdf`

Used by the PDF upload flow. The backend validates the PDF, extracts readable text with PyMuPDF, then sends that text through the same LLM vocabulary generator.

Request type: `multipart/form-data`

Fields:

| Field | Required | Description |
| ----- | -------- | ----------- |
| `file` | Yes | PDF file upload. |
| `level` | No | CEFR level. Defaults to `B1`. |
| `count` | No | Number of cards requested. Defaults to `20`. |
| `includePhrases` | No | Whether phrase cards may be included. Defaults to `true`. |

Success response:

```json
{
  "status": "success",
  "data": {
    "source": { "type": "pdf" },
    "cards": [
      {
        "term": "exacerbate",
        "definition": "To make a problem or bad situation worse.",
        "translation": "làm trầm trọng thêm",
        "partOfSpeech": "verb",
        "example": "Pollution can exacerbate health problems.",
        "sourceSentence": "Climate change can exacerbate existing inequalities.",
        "difficulty": "B1"
      }
    ]
  }
}
```

PDF validation:

- File must be non-empty.
- Filename must end with `.pdf`.
- Content type must be `application/pdf` or `application/octet-stream`.
- File bytes must start with `%PDF-`.
- PDF must not exceed configured page/file limits.
- Password-protected PDFs are rejected.
- Scanned/image-only PDFs with insufficient readable text are rejected.

## Errors

Error response format:

```json
{
  "status": "error",
  "message": "Invalid input data"
}
```

Relevant errors:

| HTTP | Message |
| ---- | ------- |
| 400 | `Invalid input data` |
| 400 | `Invalid PDF` |
| 400 | `Empty PDF` |
| 400 | `PDF exceeds the page or file size limit` |
| 400 | `Password-protected PDFs are not supported` |
| 400 | `PDF does not contain enough readable text` |
| 400 | `Vocabulary input is too large` |
| 401 | `Invalid or expired token` |
| 502 | `Vocabulary generation failed` |
| 503 | `Vocabulary generation is temporarily unavailable` |

## Backend Environment

Required for real vocabulary generation:

- `OPENAI_API_KEY`

Optional configuration:

- `VOCABULARY_LLM_MODEL`, default `gpt-4o-mini`
- `MAX_VOCABULARY_INPUT_CHARACTERS`, default `12000`
- `VOCABULARY_LLM_TIMEOUT_MS`, default `30000`

## Notes

- Android camera/image OCR runs on-device with ML Kit. The backend does not receive scan image files for OCR.
- Both scan text and PDF text converge on the same LLM vocabulary generator.
- Vocabulary generation is real when `OPENAI_API_KEY` is configured. There is no production fallback to mock cards.

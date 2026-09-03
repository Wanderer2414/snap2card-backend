# Vocabulary From PDF

Generates vocabulary cards from a PDF file for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/vocabulary/from-pdf`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/pdf` |

### Body

The raw PDF file bytes (no multipart wrapper). The request `Content-Type` must
be `application/pdf` and the body must be a valid PDF file.

### Query Parameters

| Parameter | Type   | Required | Description                                    |
| --------- | ------ | -------- | ---------------------------------------------- |
| `level`   | string | No       | Difficulty level.                              |
| `count`   | number | No       | Desired number of cards.                       |
| `includePhrases` | boolean | No  | `true`/`false` whether to include phrases.     |

For example, with `curl`:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf \
  "https://host/snap2card/api/v1.0/vocabulary/from-pdf?level=b1&count=10&includePhrases=true"
```

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "source": { "type": "pdf" },
    "cards": [
      {
        "term": "word",
        "definition": "definition",
        "translation": "translation"
      }
    ]
  }
}
```

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request / Invalid PDF |
| 401  | Unauthorized / Invalid token |
| 415  | Unsupported Media Type |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
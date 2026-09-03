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
| `Content-Type` | string | Yes | `multipart/form-data` |

### Body (multipart/form-data)

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `file` | PDF file | Yes | The PDF to extract vocabulary from, under the `file` field name. |
| `level` | string | No | Difficulty level. |
| `count` | string | No | Desired number of cards. |
| `includePhrases` | string | No | `true`/`false` whether to include phrases. |

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
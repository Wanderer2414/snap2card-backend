# Vocabulary From Text

Generates vocabulary cards from a text document for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/vocabulary/from-text`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Body

```json
{
  "text": "Full document text",
  "level": "beginner",
  "count": 10,
  "includePhrases": true
}
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `text` | string | Yes | The document text to derive vocabulary from. |
| `level` | string | No | Difficulty level. |
| `count` | number | No | Desired number of cards. |
| `includePhrases` | boolean | No | Whether to include phrases. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "source": { "type": "scan" },
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
| 400  | Bad Request |
| 401  | Unauthorized / Invalid token |
| 415  | Unsupported Media Type |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
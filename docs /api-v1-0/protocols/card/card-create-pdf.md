# Card Create PDF

Saves a PDF file for the authenticated user and records it in the database via the `FILE_INSERT` procedure.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/cards/pdf`
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

For example, with `curl`:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf \
  https://host/snap2card/api/v1.0/cards/pdf
```

## Response

### 201 Created

```json
{
  "status": "success",
  "data": {
    "numOfCard": 0,
    "cards": []
  }
}
```

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request / Invalid PDF |
| 401  | Unauthorized / Invalid token |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
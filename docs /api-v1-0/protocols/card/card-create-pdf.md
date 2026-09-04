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

Each card in `cards` contains only the generated card's front and back side text
(no `id` is returned):

```json
{
  "frontSide": "Front card text",
  "backSide": "Back card text"
}
```

### Response Parameters

| Field             | Type   | Description                                  |
| ----------------- | ------ | -------------------------------------------- |
| `numOfCard`       | number | Number of created cards.                     |
| `cards`           | array  | The created cards (id is omitted).           |
| `cards[].frontSide` | string | Front side text of the generated card.     |
| `cards[].backSide`  | string | Back side text of the generated card.      |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request / Invalid PDF |
| 401  | Unauthorized / Invalid token |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
# Card Create Document

Creates a new card for the authenticated user from a large text document.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/cards/document`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `text/plain` |

### Body

The raw plain text content (no JSON wrapper). The request `Content-Type` must be
`text/plain` and the body must be the text used to create the card.

For example, with `curl`:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: text/plain" \
  --data-binary "Full card details text" \
  https://host/snap2card/api/v1.0/cards/document
```

## Response

### 201 Created

```json
{
  "status": "success",
  "data": {
    "numOfCard": 1,
    "cards": [
      {
        "frontSide": "Full card details text",
        "backSide": "Full card details text"
      }
    ]
  }
}
```

### Response Parameters

| Field                | Type   | Description                                  |
| -------------------- | ------ | -------------------------------------------- |
| `numOfCard`          | number | Number of created cards.                     |
| `cards`              | array  | The created cards (id is omitted).           |
| `cards[].frontSide`  | string | Front side text of the created card.         |
| `cards[].backSide`   | string | Back side text of the created card.          |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request |
| 401  | Unauthorized / Invalid token |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
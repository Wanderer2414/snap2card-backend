# Card Create Manual

Creates a new card for the authenticated user from manually entered front and back side text.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/cards/manual`
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
  "frontSide": "Front card text",
  "backSide": "Back card text"
}
```

### Parameters

| Field       | Type   | Required | Description       |
| ----------- | ------ | -------- | ----------------- |
| `frontSide` | string | Yes      | Front side text.  |
| `backSide`  | string | Yes      | Back side text.   |

## Response

### 201 Created

```json
{
  "status": "success",
  "data": {
    "numOfCard": 1,
    "cards": [
      {
        "id": "CARD1234567890",
        "frontSide": "Front card text"
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
| 500  | Internal Server Error |
| 426  | Version Mismatch |
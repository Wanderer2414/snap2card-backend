# Card List

Lists the cards for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/cards/list`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "numOfCard": 12,
    "cards": [
      {
        "id": "CARD1234567890",
        "frontSide": "Front side text"
      }
    ]
  }
}
```

### Response Parameters

| Field       | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| `numOfCard` | number | Total number of cards.               |
| `cards`     | array  | List of cards.                       |
| `cards[].id` | [Card ID](../definitions/object-types.md#id) | Unique identifier of the card. |
| `cards[].frontSide` | string | Front side text (display name) of the card. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

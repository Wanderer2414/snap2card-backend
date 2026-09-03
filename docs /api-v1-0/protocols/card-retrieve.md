# Card Retrieve

Retrieves one or more cards for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/cards`
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
  "ids": ["CARD1234567890"]
}
```

### Parameters

| Field | Type | Required | Description                          |
| ----- | ---- | -------- | ------------------------------------ |
| `ids` | array of [Card ID](../definitions/object-types.md#id) | No | List of card IDs to retrieve. Omit to list all. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "CARD1234567890",
      "frontSide": "Front side text",
      "backSide": "Back side text"
    }
  ]
}
```

### Response Parameters

| Field         | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| `id`          | [Card ID](../definitions/object-types.md#id) | Unique identifier of the card.       |
| `frontSide`   | string | Front side text of the card.         |
| `backSide`    | string | Back side text of the card.          |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

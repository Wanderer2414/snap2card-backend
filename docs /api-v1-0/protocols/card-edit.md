# Card Edit

Updates an existing card for the authenticated user.

- **Method:** `PUT`
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
  "id": "CARD1234567890",
  "frontSide": "Updated front side text",
  "backSide": "Updated back side text",
  "categories": [
    "CAT1234567890",
    "CAT9876543210"
  ]
}
```

### Parameters

| Field        | Type   | Required | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| `id`         | [Card ID](../definitions/object-types.md#id) | Yes | ID of the card to edit.           |
| `frontSide`  | string | No       | Updated front side text.                   |
| `backSide`   | string | No       | Updated back side text.                    |
| `categories` | array of [Category ID](../definitions/object-types.md#id) | No | Updated list of categories the card belongs to. |

## Response

### 200 OK

```json
{
  "status": "success"
}
```

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

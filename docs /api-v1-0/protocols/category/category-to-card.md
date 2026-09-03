# Category To Card

Assigns a card to one or more categories.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/cards/categorize`
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
  "cardId": "CARD1234567890",
  "categoryIds": ["CATE1234567890", "CATE2345678901"]
}
```

### Parameters

| Field         | Type              | Required | Description                            |
| ------------- | ----------------- | -------- | -------------------------------------- |
| `cardId`      | [Card ID](../definitions/object-types.md#id) | Yes | Card to assign.                        |
| `categoryIds` | array of [Category ID](../definitions/object-types.md#id) | Yes | Categories to assign the card to. |

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
| 401  | Unauthorized |
| 400  | Bad Request |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

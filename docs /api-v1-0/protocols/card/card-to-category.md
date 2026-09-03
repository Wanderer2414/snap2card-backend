# Card To Category

Assigns one or more cards to a category.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/categories/categorize`
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
  "categoryId": "CATE1234567890",
  "cardIds": ["CARD1234567890", "CARD2345678901"]
}
```

### Parameters

| Field        | Type              | Required | Description                             |
| ------------ | ----------------- | -------- | --------------------------------------- |
| `categoryId` | [Category ID](../definitions/object-types.md#id) | Yes | Category to assign cards to. |
| `cardIds`    | array of [Card ID](../definitions/object-types.md#id) | Yes | Cards to assign to the category. |

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

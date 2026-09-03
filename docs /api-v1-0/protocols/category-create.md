# Category Create

Creates a new category for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/categories`
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
  "name": "BANKING"
}
```

### Parameters

| Field  | Type   | Required | Description                              |
| ------ | ------ | -------- | ---------------------------------------- |
| `name` | string | Yes      | Category name. Must be uppercase, max 20 characters. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "categoryId": "CATE1234567890"
  }
}
```

### Response Parameters

| Field        | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| `categoryId` | string | Unique identifier of the new category. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 400  | Bad Request |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

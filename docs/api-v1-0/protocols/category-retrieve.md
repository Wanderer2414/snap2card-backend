# Category Retrieve

Retrieves one or more categories for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/categories`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |

### Query Parameters

| Field | Type | Required | Description                       |
| ----- | ---- | -------- | --------------------------------- |
| `id`  | [Category ID](../definitions/object-types.md#id) | No     | Category ID. Omit to list all.    |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "CAT1234567890",
      "name": "Banking",
      "numOfCard": 12,
      "createdAt": {
        "year": 2026,
        "month": 1,
        "day": 1,
        "hour": 0,
        "minute": 0,
        "second": 0,
        "gmt": "+00:00"
      }
    }
  ]
}
```

### Response Parameters

| Field         | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| *(each item)* | [Category](../definitions/object-types.md#category) | A category object. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 404  | Not Found |
| 500  | Internal Server Error |

# Category List

Lists the categories for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/categories/list`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "categoryNum": 3,
    "categories": [
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
}
```

### Response Parameters

| Field              | Type   | Description                          |
| ------------------ | ------ | ------------------------------------ |
| `categoryNum`      | number | Total number of categories.          |
| `categories`       | array  | List of categories.                  |
| `categories[].id`  | [Category ID](../definitions/object-types.md#id) | Unique identifier of the category. |
| `categories[].name` | string | Name of the category.                |
| `categories[].numOfCard` | number | Number of cards in the category. |
| `categories[].createdAt` | [Time](../definitions/object-types.md#time) | Timestamp when the first card was added to the category. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

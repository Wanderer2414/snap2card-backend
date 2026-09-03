# Category Retrieve

Retrieves a single category for the authenticated user, including all of its cards.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/categories`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field | Type | Required | Description                       |
| ----- | ---- | -------- | --------------------------------- |
| `id`  | [Category ID](../definitions/object-types.md#id) | Yes     | Category ID to retrieve.          |

Example:

```http
GET /snap2card/api/v1.0/categories?id=CATE1234567890
```

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "name": "Banking",
    "numOfCard": 12,
    "mastery": 2.5,
    "createdAt": {
      "year": 2026,
      "month": 1,
      "day": 1,
      "hour": 0,
      "minute": 0,
      "second": 0,
      "gmt": "+00:00"
    },
    "cardIds": [
      "CARD1234567890",
      "CARD2345678901"
    ]
  }
}
```

### Response Parameters

| Field       | Type   | Description                                   |
| ----------- | ------ | --------------------------------------------- |
| `name`      | string | Name of the category.                         |
| `numOfCard` | number | Number of cards in the category.              |
| `mastery`   | number/null | The category mastery, the average of each card's `true_count / false_count` ratio. `null` when the category has no cards. |
| `createdAt` | [Time](../definitions/object-types.md#time) | Timestamp when the first card was added to the category. |
| `cardIds`   | array  | List of [Card IDs](../definitions/object-types.md#id) belonging to the category. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

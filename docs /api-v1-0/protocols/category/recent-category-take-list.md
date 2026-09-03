# Recent Category Take List

Lists the `n` most recent distinct categories the authenticated user has taken
exams in, ordered by most recent take (descending).

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/categories/recent`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field | Type   | Required | Description                                                       |
| ----- | ------ | -------- | ----------------------------------------------------------------- |
| `n`   | number | No       | Maximum number of categories to return. Defaults to `10`. A value `<= 0` returns an empty list. |

Example:

```http
GET /snap2card/api/v1.0/categories/recent?n=5
```

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "categoryId": "CATE1234567890",
      "name": "Banking",
      "mastery": 2.5,
      "lastTakenAt": {
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

| Field          | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `categoryId`   | [Category ID](../definitions/object-types.md#id) | Unique identifier of the category. |
| `name`         | string | Name of the category.                         |
| `mastery`      | number/null | The category mastery read from `ACCOUNT_CATEGORY_FOLLOW.mastery_score`. `null` when the account has no mastery recorded for the category. |
| `lastTakenAt`  | [Time](../definitions/object-types.md#time) | Timestamp of the category's latest exam take. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request (invalid `n`) |
| 401  | Unauthorized |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

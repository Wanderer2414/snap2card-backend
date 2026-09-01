# Activities Retrieve

Retrieves activity history for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/activities`
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
    "streak": 5,
    "cardsThisMonth": 42,
    "offset": 3,
    "counts": [3, 5, 2, 0, 1]
  }
}
```

### Response Parameters

| Field              | Type   | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| `streak`           | number | Current consecutive-day streak.               |
| `cardsThisMonth`   | number | Total number of cards used this month.        |
| `offset`           | number | Offset of the starting day of the month.      |
| `counts`           | array of number | Number of cards used on each day, starting from the offset day. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

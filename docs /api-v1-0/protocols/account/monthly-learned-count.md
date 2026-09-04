# Monthly Learned Count

Returns the number of cards learned by the authenticated user on each day of the
current month (from the first day of the month to today). Days with no exams
return `cardCount = 0`.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/account/monthly-learned-count`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    { "day": "2026-09-01", "cardCount": 5 },
    { "day": "2026-09-02", "cardCount": 0 },
    { "day": "2026-09-03", "cardCount": 3 },
    { "day": "2026-09-04", "cardCount": 0 }
  ]
}
```

### Response Parameters

| Field          | Type   | Description                                             |
| -------------- | ------ | ------------------------------------------------------- |
| `day`          | string | Date in `YYYY-MM-DD` format.                            |
| `cardCount`    | number | Number of distinct cards learned on that day (0 if none). |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized / Invalid token |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
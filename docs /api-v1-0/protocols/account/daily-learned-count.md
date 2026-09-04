# Daily Learned Count

Returns the number of cards learned by the authenticated user on a given date.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/account/daily-learned-count`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field   | Type   | Required | Description                                  |
| ------- | ------ | -------- | -------------------------------------------- |
| `year`  | number | Yes      | Year (1000–9999).                            |
| `month` | number | Yes      | Month (1–12).                                |
| `day`   | number | Yes      | Day (1–31).                                  |

Example:

```http
GET /snap2card/api/v1.0/account/daily-learned-count?year=2026&month=9&day=1
```

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "count": 5
  }
}
```

### Response Parameters

| Field   | Type   | Description                                         |
| ------- | ------ | --------------------------------------------------- |
| `count` | number | Number of distinct cards learned on that date (0 if none). |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request (invalid `year`, `month`, or `day`) |
| 401  | Unauthorized / Invalid token |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
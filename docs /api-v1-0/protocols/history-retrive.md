# History Retrieve

Retrieves the transaction/history log for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/history`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |

### Query Parameters

| Field    | Type | Required | Description                          |
| -------- | ---- | -------- | ------------------------------------ |
| `from`   | string | No     | Start date (`YYYY-MM-DD`).           |
| `to`     | string | No     | End date (`YYYY-MM-DD`).             |
| `limit`  | number | No     | Max number of results (default 50).  |
| `page`   | number | No     | Page number for pagination.          |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "id": "HIS1234567890",
      "cardId": "CARD1234567890",
      "amount": -49.99,
      "currency": "USD",
      "description": "Online purchase",
      "occurredAt": {
        "year": 2026,
        "month": 1,
        "day": 1,
        "hour": 0,
        "minute": 0,
        "second": 0,
        "gmt": "+00:00"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 120
  }
}
```

### Response Parameters

| Field              | Type   | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| `id`               | [History ID](../definitions/object-types.md#id) | Unique identifier of the history record.      |
| `cardId`           | [Card ID](../definitions/object-types.md#id) | ID of the card the record belongs to.         |
| `amount`           | number | Amount of the record (negative = outgoing).   |
| `currency`         | string | Currency of the amount.                       |
| `description`      | string | Description of the transaction.               |
| `occurredAt`       | object | Timestamp when the transaction occurred ([Time](../definitions/object-types.md#time)). |
| `page`             | number | Current page number.                          |
| `limit`            | number | Number of results per page.                   |
| `total`            | number | Total number of records available.            |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

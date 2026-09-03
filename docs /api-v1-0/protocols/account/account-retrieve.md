# Account Retrieve

Retrieves the authenticated user's account details.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/account`
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
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "dailyGoal": 10,
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
}
```

### Response Parameters

| Field          | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `email`        | string | Email address of the user.                    |
| `name`         | string | Display name of the user.                     |
| `phone`        | string | Phone number of the user.                     |
| `dailyGoal`    | number | The user's daily goal.                        |
| `createdAt`    | object | Timestamp when the account was created ([Time](../definitions/object-types.md#time)). |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

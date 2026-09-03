# Account Register

Creates a new account.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/account/register`
- **Auth:** None

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Content-Type` | string | Yes | `application/json` |

### Body

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "secret-password"
}
```

### Parameters

| Field      | Type    | Required | Description         |
| ---------- | ------- | -------- | ------------------- |
| `name`     | string  | Yes      | Display name (max 60 characters). |
| `email`    | string  | Yes      | Email address.      |
| `phone`    | string  | Yes      | Phone number.       |
| `password` | string  | Yes      | Password (max 100 characters). |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "accountId": "ACNT1234567890"
  }
}
```

### Response Parameters

| Field       | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `accountId` | string | Unique identifier of the new account. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

# Account Login

Authenticates a user and returns an access token.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/account/login`
- **Auth:** None

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Content-Type` | string | Yes | `application/json` |

### Body

```json
{
  "email": "user@example.com",
  "password": "secret-password"
}
```

### Parameters

| Field    | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| `email`  | string | Yes      | User email address.        |
| `password` | string | Yes   | User password.             |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "token": "session-token"
  }
}
```

### Response Parameters

| Field   | Type   | Description                                                   |
| ------- | ------ | ------------------------------------------------------------- |
| `token` | string | Access token that embeds the session id and user id.          |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

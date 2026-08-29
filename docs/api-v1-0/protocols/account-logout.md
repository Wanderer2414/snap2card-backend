# Account Logout

Invalidates the current user's session/token.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/account/logout`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |

### Body

```json
{}
```

## Response

### 200 OK

```json
{
  "status": "success"
}
```

### Response Parameters

| Field   | Type   | Description                                                   |
| ------- | ------ | ------------------------------------------------------------- |
| `status` | string | Status of the request (`success`).                            |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

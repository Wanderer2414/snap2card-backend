# Account Avatar Retrieve

Retrieves the authenticated user's avatar as raw PNG image data.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/account/avatar`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

## Response

### 200 OK

Returns the raw PNG image bytes.

| Header         | Value        |
| -------------- | ------------ |
| `Content-Type` | `image/png`  |
| `Content-Length` | `<bytes>`  |

Body: the binary PNG data of the user's avatar.

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 404  | Not Found (no avatar set) |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

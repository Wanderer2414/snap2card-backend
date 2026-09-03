# Account Avatar Retrieve

Retrieves the authenticated user's avatar as raw image data.

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

Returns the raw image bytes of the user's avatar.

| Header         | Value        |
| -------------- | ------------ |
| `Content-Type` | One of the avatar's actual image types: `image/png`, `image/jpeg`, `image/webp`, `image/bmp`, `image/x-icon` |
| `Content-Length` | `<bytes>`  |

Body: the binary image data of the user's avatar.

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 404  | Not Found (no avatar set) |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

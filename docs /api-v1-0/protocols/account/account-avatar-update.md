# Account Avatar Update

Updates the authenticated user's avatar by uploading an image file.

- **Method:** `PUT`
- **Endpoint:** `/snap2card/api/v1.0/account/avatar`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | One of: `image/png`, `image/jpeg`, `image/webp`, `image/bmp`, `image/x-icon`. |

### Body

The raw image file bytes (no multipart wrapper). The request `Content-Type`
must be one of the image types listed above and the body must be a valid image
file. The actual format is detected from the file's signature, so `png`, `jpg`,
`webp`, `bmp` and `ico` files are accepted.

For example, with `curl`:

```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: image/png" \
  --data-binary @avatar.png \
  https://host/snap2card/api/v1.0/account/avatar
```

or with a JPEG:

```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @avatar.jpg \
  https://host/snap2card/api/v1.0/account/avatar
```

## Response

### 200 OK

```json
{
  "status": "success"
}
```

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request (invalid or unsupported image) |
| 401  | Unauthorized |
| 404  | Not Found |
| 415  | Unsupported Media Type |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

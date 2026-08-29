# Category Edit

Updates an existing category for the authenticated user.

- **Method:** `PUT`
- **Endpoint:** `/snap2card/api/v1.0/categories`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Body

```json
{
  "id": "CAT1234567890",
  "name": "Updated Category"
}
```

### Parameters

| Field   | Type   | Required | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| `id`    | [Category ID](../definitions/object-types.md#id) | Yes | ID of the category to edit. |
| `name`  | string | No       | Updated category name.             |

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
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

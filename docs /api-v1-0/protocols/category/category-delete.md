# Category Delete

Removes a category for the authenticated user. The behavior depends on the
account's relationship to the category:

- If the account **owns** the category, the category is deleted entirely.
- Otherwise the account only **unfollows** the category (just this account's
  follow row is removed; the category and its exams are kept).

- **Method:** `DELETE`
- **Endpoint:** `/snap2card/api/v1.0/categories`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field | Type   | Required | Description                                 |
| ----- | ------ | -------- | ------------------------------------------- |
| `id`  | [Category ID](../definitions/object-types.md#id) | Yes | ID of the category to delete. |

Example:

```http
DELETE /snap2card/api/v1.0/categories?id=CATE1234567890
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
| 400  | Bad Request (invalid `id`) |
| 401  | Unauthorized / Invalid token |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
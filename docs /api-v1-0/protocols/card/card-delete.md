# Card Delete

Removes a card for the authenticated user. The behavior depends on the account's
relationship to the card:

- If the account **created** the card, the card is deleted entirely.
- Otherwise the account only **un-haves** the card (just this account's
  ownership row is removed; the card itself is kept).

- **Method:** `DELETE`
- **Endpoint:** `/snap2card/api/v1.0/cards`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field | Type   | Required | Description                             |
| ----- | ------ | -------- | --------------------------------------- |
| `id`  | [Card ID](../definitions/object-types.md#id) | Yes | ID of the card to delete. |

Example:

```http
DELETE /snap2card/api/v1.0/cards?id=CARD1234567890
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
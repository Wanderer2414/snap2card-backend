# Account Edit

Updates the authenticated user's account details.

- **Method:** `PUT`
- **Endpoint:** `/snap2card/api/v1.0/account`
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
  "type": "total",
  "name": "John Doe",
  "email": "new-email@example.com",
  "phone": "+1234567890",
  "dailyGoal": 10
}
```

### Parameters

| Field       | Type   | Required | Description                                                       |
| ----------- | ------ | -------- | ----------------------------------------------------------------- |
| `type`      | string | Yes      | Field to update: `total`, `name`, `email`, `phone`, or `dailyGoal`. |
| `name`      | string | No       | Updated display name (used when `type` is `name` or `total`).      |
| `email`     | string | No       | Updated email address (used when `type` is `email` or `total`).    |
| `phone`     | string | No       | Updated phone number (used when `type` is `phone` or `total`).     |
| `dailyGoal` | number | No       | Updated daily goal (used when `type` is `dailyGoal` or `total`).   |

## Update by Type

The `type` field determines which account field is updated.

### Type `total`

Updates all provided fields at once.

```json
{
  "type": "total",
  "name": "John Doe",
  "email": "new-email@example.com",
  "phone": "+1234567890",
  "dailyGoal": 10
}
```

### Type `name`

Updates only the display name.

```json
{
  "type": "name",
  "name": "John Doe"
}
```

### Type `email`

Updates only the email address.

```json
{
  "type": "email",
  "email": "new-email@example.com"
}
```

### Type `phone`

Updates only the phone number.

```json
{
  "type": "phone",
  "phone": "+1234567890"
}
```

### Type `dailyGoal`

Updates only the daily goal.

```json
{
  "type": "dailyGoal",
  "dailyGoal": 20
}
```

> **Note:** Updating the avatar is handled by a separate endpoint:
> [Account Avatar Update](account-avatar-update.md).

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
| 400  | Bad Request |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

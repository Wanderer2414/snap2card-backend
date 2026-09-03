# Exam Start

Starts an exam session for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/exams/start`
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
  "examId": "EXAM1234567890"
}
```

### Parameters

| Field    | Type   | Required | Description              |
| -------- | ------ | -------- | ------------------------ |
| `examId` | string | Yes      | Unique identifier of the exam to start. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "examLogId": "LOG1234567890"
  }
}
```

### Response Parameters

| Field        | Type   | Description                                        |
| ------------ | ------ | -------------------------------------------------- |
| `examLogId`  | string | Unique identifier of the created exam log/session. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

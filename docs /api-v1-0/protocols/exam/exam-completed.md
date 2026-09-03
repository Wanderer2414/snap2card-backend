# Exam Completed

Finalizes an exam log, setting its end time and grading the exam.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/exams/completed`
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
  "examLogId": "LOG1234567890"
}
```

### Parameters

| Field       | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| `examLogId` | string | Yes      | Unique identifier of the exam log to finalize. |

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
| 401  | Unauthorized |
| 400  | Bad Request |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

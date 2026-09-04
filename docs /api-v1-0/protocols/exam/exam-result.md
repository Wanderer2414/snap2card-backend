# Exam Result

Saves a quiz result against an exam log for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/exams/result`
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
  "examLogId": "LOG1234567890",
  "quizId": "QUIZ1234567890",
  "result": true
}
```

### Parameters

| Field        | Type    | Required | Description                           |
| ------------ | ------- | -------- | ------------------------------------- |
| `examLogId`  | string  | Yes      | Unique identifier of the exam log.    |
| `quizId`     | string  | Yes      | Unique identifier of the quiz.        |
| `result`     | boolean | Yes      | Whether the answer was correct (`true`) or incorrect (`false`). |

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
| 400  | Bad Request / Invalid input data |
| 401  | Unauthorized / Invalid token |
| 404  | Not Found (invalid exam log or quiz) |
| 409  | Conflict (a result for this quiz already exists on this exam log) |
| 422  | Exam log has already been completed |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

# Exam Review

Retrieves the quizzes for reviewing an exam taken by the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/exams/review`
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

| Field    | Type   | Required | Description                       |
| -------- | ------ | -------- | --------------------------------- |
| `examId` | string | Yes      | Unique identifier of the exam to review. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "numOfQuiz": 20,
    "quizzes": [
      {
        "quizId": "QUIZ1234567890",
        "frontSide": "Front side text",
        "backSide": "Back side text"
      }
    ]
  }
}
```

### Response Parameters

| Field       | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| `numOfQuiz` | number | Total number of quizzes.             |
| `quizzes`   | array  | List of quizzes.                     |
| `quizzes[].quizId` | string | Unique identifier of the quiz. |
| `quizzes[].frontSide` | string | Front side text of the quiz. |
| `quizzes[].backSide` | string | Back side text of the quiz. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

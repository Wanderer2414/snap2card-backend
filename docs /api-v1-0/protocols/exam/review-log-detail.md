# Exam Review Log Detail

Returns the full detail of a completed exam log: the exam header and the list of answered quizzes.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/exams/review-log-detail`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Field       | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| `examLogId` | string | Yes      | Unique identifier of the completed exam log.  |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "logId": "LOG1234567890",
    "examName": "Beginner Vocabulary",
    "examLevel": "B1",
    "resultScore": 18,
    "totalScore": 20,
    "numOfQuiz": 20,
    "dateDone": {
      "year": 2026,
      "month": 1,
      "day": 1,
      "hour": 0,
      "minute": 0,
      "second": 0,
      "gmt": "+00"
    },
    "quizResults": [
      {
        "quizId": "QUIZ1234567890",
        "frontSide": "Front side text",
        "backSide": "Back side text",
        "accountAnswer": true,
        "resultScore": 1,
        "totalScore": 1
      }
    ]
  }
}
```

### Response Parameters

| Field                    | Type   | Description                          |
| ------------------------ | ------ | ------------------------------------ |
| `logId`                  | string | Unique identifier of the exam log.   |
| `examName`               | string | Name of the exam.                    |
| `examLevel`              | string | Level of the exam.                   |
| `resultScore`            | number | The account's total score.           |
| `totalScore`             | number | The maximum possible score.          |
| `numOfQuiz`              | number | Number of quizzes in the exam log.   |
| `dateDone`               | [Time](../definitions/object-types.md#time) | Timestamp when the exam log was completed. |
| `quizResults`            | array  | The answered quizzes of the exam log. |
| `quizResults[].quizId`   | string | Unique identifier of the quiz.        |
| `quizResults[].frontSide`| string | Front side text of the quiz.          |
| `quizResults[].backSide` | string | Back side text of the quiz.           |
| `quizResults[].accountAnswer` | boolean | Whether the account answered the quiz. |
| `quizResults[].resultScore` | number | Score earned on the quiz (1 if answered correctly, else 0). |
| `quizResults[].totalScore` | number | Maximum score of the quiz (1).        |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request / Invalid exam log id format |
| 401  | Unauthorized |
| 404  | Not Found (exam log does not exist) |
| 500  | Internal Server Error |
| 426  | Version Mismatch |
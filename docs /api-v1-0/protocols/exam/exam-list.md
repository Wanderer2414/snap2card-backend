# Exam List

Lists the exams available to the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/exams/list`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "examId": "EXAM1234567890",
      "examName": "Beginner Vocabulary",
      "numOfQuestion": 20,
      "dateCreated": {
        "year": 2026,
        "month": 1,
        "day": 1,
        "hour": 0,
        "minute": 0,
        "second": 0,
        "gmt": "+00:00"
      }
    }
  ]
}
```

### Response Parameters

| Field           | Type    | Description                          |
| --------------- | ------- | ------------------------------------ |
| `examId`        | string  | Unique identifier of the exam.       |
| `examName`      | string  | Name of the exam.                    |
| `numOfQuestion` | number  | Number of questions in the exam.     |
| `dateCreated`   | [Time](../definitions/object-types.md#time) | Timestamp when the exam was created. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

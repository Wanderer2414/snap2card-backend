# Category Log Related

Lists the completed exam logs whose exams belong to a category of the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/snap2card/api/v1.0/categories/logs`
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
  "categoryId": "CATE1234567890"
}
```

### Parameters

| Field        | Type   | Required | Description                            |
| ------------ | ------ | -------- | -------------------------------------- |
| `categoryId` | [Category ID](../definitions/object-types.md#id) | Yes | Category whose exam logs to list. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": [
    {
      "logId": "LOG1234567890",
      "examName": "Beginner Vocabulary",
      "score": 18,
      "totalScore": 20,
      "start": {
        "year": 2026,
        "month": 1,
        "day": 1,
        "hour": 0,
        "minute": 0,
        "second": 0,
        "gmt": "+00:00"
      },
      "end": {
        "year": 2026,
        "month": 1,
        "day": 1,
        "hour": 0,
        "minute": 30,
        "second": 0,
        "gmt": "+00:00"
      }
    }
  ]
}
```

### Response Parameters

| Field       | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| `logId`     | string | Unique identifier of the exam log.   |
| `examName`  | string | Name of the exam.                    |
| `score`     | number | Number of correctly answered questions. |
| `totalScore`| number | Total number of questions.           |
| `start`     | [Time](../definitions/object-types.md#time) | Timestamp when the exam started. |
| `end`       | [Time](../definitions/object-types.md#time) | Timestamp when the exam ended. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 400  | Bad Request |
| 404  | Not Found |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

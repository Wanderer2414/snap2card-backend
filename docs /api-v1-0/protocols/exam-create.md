# Exam Create

Creates a new exam from a category.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/exams/create`
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
| `categoryId` | string | Yes      | [Category ID](../definitions/object-types.md#id) to create the exam from. |

## Response

### 200 OK

```json
{
  "status": "success",
  "data": {
    "examId": "EXAM1234567890"
  }
}
```

### Response Parameters

| Field    | Type   | Description                         |
| -------- | ------ | ----------------------------------- |
| `examId` | string | Unique identifier of the created exam. |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 401  | Unauthorized |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

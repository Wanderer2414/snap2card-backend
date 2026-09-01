# Error Codes

A summary of all error codes used across the API.

All errors share the same response structure:

```json
{
  "status": "error",
  "message": "Error description"
}
```

## 400 Bad Request

Returned when the request contains invalid or missing input.

| Message                        | Occurrence             |
| ------------------------------ | ---------------------- |
| `Invalid input data`           | Account Edit           |
| `Missing required field: name` | Card Create            |

## 401 Unauthorized

Returned when authentication fails or the token is invalid/expired.

| Message                      | Occurrence                       |
| ---------------------------- | -------------------------------- |
| `Invalid or expired token`   | All authenticated endpoints      |
| `Invalid email or password`  | Account Login                    |

## 404 Not Found

Returned when the requested resource does not exist.

| Message            | Occurrence             |
| ------------------ | ---------------------- |
| `Card not found`   | Card Retrieve, Card Edit    |
| `Category not found` | Category Retrieve, Category Edit |

## 500 Internal Server Error

Returned when an unexpected server failure occurs.

| Message                 | Occurrence        |
| ----------------------- | ----------------- |
| `Internal server error` | All endpoints     |

## 426 Version Mismatch

Returned when the requested API version does not match the supported version.

| Message                     | Occurrence     |
| --------------------------- | -------------- |
| `Version mismatch`          | All endpoints  |

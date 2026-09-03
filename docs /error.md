# Snap2Card Error Codes

A summary of every error code raised by the database layer.

## Overview

All input validation happens at the **protocol layer** (the API boundary).
Protocol functions reject invalid input before delegating to internal functions,
so internal functions (`FN_*`, `PR_*`) always receive valid data and never raise
business-rule exceptions.

Exceptions are raised with the standard PostgreSQL `USING ERRCODE` clause. The
`SQLSTATE` (5 characters) is the stable error code; the message explains the
specific detail.

```sql
-- example
RAISE EXCEPTION 'email must not be null' USING ERRCODE = '50001';
```

## Error codes

| SQLSTATE   | Meaning                  | Message                                  |
| ---------- | ------------------------ | ---------------------------------------- |
| `50001`    | Missing required input   | `name must not be null`, `at least one field must not be null`, `email must not be null`, `phone must not be null`, `password must not be null`, `text must not be null`, `file source must not be null`, `file name must not be null`, `hash code must not be null`, `file type must not be null`, `frontside must not be null`, `backside must not be null`, `creator must not be null`, `owner id must not be null`, `endpoint must not be null`, `header must not be null`, `body must not be null`, `response header must not be null`, `response body must not be null`, `account id must not be null`, `category id must not be null`, `card ids must not be null`, `card id must not be null`, `category ids must not be null`, `session id must not be null`, `exam id must not be null`, `exam log id must not be null`, `quiz id must not be null`, `result must not be null` |
| `50002`    | Value exceeds max length | `name must not exceed 60 characters`, `name must not exceed 20 characters`, `file name must not exceed 60 characters`, `hash code must not exceed 64 characters`, `password must not exceed 100 characters`, `endpoint must not exceed 60 characters` |
| `50003`    | Conflicting values       | `frontside and backside must be different`, `exam log has no answered questions` |
| `50004`    | Referenced record missing| `owner id does not exist`, `component not found`, `account does not exist`, `card not found`, `category not found`, `exam not found`, `exam log not found`, `quiz not found` |
| `50005`    | Required state missing   | `no active session found for account`, `no active session found` |
| `50006`    | Invalid ID format        | `invalid account id format`, `invalid card id format`, `invalid category id format`, `invalid session id format`, `invalid component id format`, `invalid exam id format`, `invalid quiz id format`, `invalid log id format` |
| `50007`    | Limit exceeded           | `excess num of keywords`                 |
| `50008`    | Invalid credentials      | `invalid email or password`              |

Accepted `TYPE_ID` prefixes: `ACNT` (account), `CARD` (card), `CATE` (category),
`SESS` (session), `COMP` (component), `EXAM` (exam), `QUIZ` (quiz), `LOG` (exam
log).

## Where each code is raised

| Protocol function        | SQLSTATE                       |
| ------------------------ | ------------------------------ |
| `ACCOUNT_INSERT`         | `50001`, `50002`               |
| `ACCOUNT_LOGIN`          | `50001`, `50008`               |
| `ACCOUNT_RETRIEVE`       | `50001`, `50006`               |
| `UPDATE_ACCOUNT`         | `50001`, `50002`, `50004`, `50006` |
| `ACCOUNT_LOGOUT`         | `50001`, `50005`, `50006`      |
| `CARD_INSERT`            | `50001`, `50003`, `50006`      |
| `CARD_LIST`              | `50001`, `50006`               |
| `CARD_RETRIEVE`          | `50001`, `50006`               |
| `CATEGORY_LIST`          | `50001`, `50006`               |
| `CATEGORY_RETRIEVE`      | `50001`, `50006`               |
| `CATEGORY_INSERT`        | `50001`, `50002`, `50004`, `50006` |
| `CATEGORY_TO_CARD_CATEGORIZE` | `50001`, `50004`, `50006` |
| `CARD_TO_CATEGORY_CATEGORIZE` | `50001`, `50004`, `50006` |
| `CATEGORY_LOG_RELATED`   | `50001`, `50004`, `50006`      |
| `COMPONENT_INSERT`       | `50001`, `50004`, `50006`      |
| `COMPONENT_RETRIEVE`     | `50001`, `50004`, `50007`      |
| `FILE_INSERT`            | `50001`, `50002`, `50004`, `50006` |
| `REQUEST_LOG_INSERT`     | `50001`, `50002`               |
| `SESSION_CHECK`          | `50006`                        |
| `EXAM_CREATE`            | `50001`, `50004`, `50006`      |
| `EXAM_START`             | `50001`, `50004`, `50005`, `50006` |
| `EXAM_REVIEW_RETRIEVE`   | `50001`, `50004`, `50006`      |
| `EXAM_LOG_REVIEW_RESULT` | `50001`, `50004`, `50006`      |
| `EXAM_COMPLETED`         | `50001`, `50003`, `50004`, `50006` |

`SESSION_CHECK` returns `NULL` (instead of raising) for null or expired sessions.

## Mapping to HTTP statuses

These SQLSTATE codes are database-layer codes. When exposed over HTTP (see
`docs/api-v1-0/definitions/errors.md`), they map conceptually as follows:

| SQLSTATE   | HTTP status                    |
| ---------- | ------------------------------ |
| `50001`, `50002`, `50003`, `50006`, `50007` | `400 Bad Request` |
| `50004`, `50005`           | `404 Not Found`                |
| `50008`    | `401 Unauthorized`             |
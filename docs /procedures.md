# Snap2Card Protocol Procedures

A summary of every **procedure** in the protocol layer (`protocols/*.sql`).

Protocol procedures are the API boundary for write operations that return no
result: they validate input (rejecting invalid input with the error codes
documented in [`docs/error.md`](error.md)) and then delegate to the internal
`PR_*` procedures, which are assumed to receive valid data only.

## Procedures

### Accounts

**`ACCOUNT_LOGOUT`** — ends the active session(s) of an account.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns: nothing.

Errors: `50001`, `50005`, `50006`.

---

### Exams

**`EXAM_LOG_REVIEW_RESULT`** — records a user's answer to a review quiz on an
exam log.

| Parameter      | Type      |
| -------------- | --------- |
| `p_exam_log_id`| `TYPE_ID` |
| `p_quiz_id`    | `TYPE_ID` |
| `p_result`     | `BOOLEAN` |

Returns: nothing.

Errors: `50001`, `50004`, `50006`.
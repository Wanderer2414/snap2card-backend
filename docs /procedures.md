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

### Categories

**`CATEGORY_TO_CARD_CATEGORIZE`** — assigns a card to one or more categories.

| Parameter       | Type        |
| --------------- | ----------- |
| `p_card_id`     | `TYPE_ID`   |
| `p_category_ids`| `TYPE_ID[]` |

Returns: nothing.

Errors: `50001`, `50004`, `50006`.

---

**`CARD_TO_CATEGORY_CATEGORIZE`** — assigns one or more cards to a category.

| Parameter       | Type        |
| --------------- | ----------- |
| `p_category_id` | `TYPE_ID`   |
| `p_card_ids`    | `TYPE_ID[]` |

Returns: nothing.

Errors: `50001`, `50004`, `50006`.

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

If a result for the same `(p_exam_log_id, p_quiz_id)` already exists, the
conflict is reported rather than ignored.

Errors: `50001`, `50003`, `50004`, `50006`.

---

**`EXAM_COMPLETED`** — finalizes an exam log: sets its end time and grades it by
counting the number of correctly answered (TRUE) review questions.

| Parameter      | Type      |
| -------------- | --------- |
| `p_exam_log_id`| `TYPE_ID` |

Returns: nothing.

Errors: `50001`, `50003`, `50004`, `50006`.
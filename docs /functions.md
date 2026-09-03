# Snap2Card Protocol Functions

A summary of every **function** in the protocol layer (`protocols/*.sql`).

Protocol functions are the API boundary: they validate input (rejecting invalid
input with the error codes documented in [`docs/error.md`](error.md)) and then
delegate to the internal `FN_*` functions, which are assumed to receive valid
data only.

## Parameter types

Custom domain types used by protocol signatures:

| Type                | Underlying      | Constraint                                        |
| ------------------- | --------------- | ------------------------------------------------- |
| `TYPE_ID`           | `CHAR(15)`      | `LENGTH(VALUE) = 15`; prefix defines entity: `ACNT`, `CARD`, `CATE`, `SESS`, `COMP`, `EXAM`, `QUIZ`, `LOG`, `FILE` |
| `TYPE_EMAIL`        | `citext`        | Valid email pattern                               |
| `TYPE_PASSWORD`     | `CHAR(100)`     | Max 100 characters                                |
| `TYPE_NAME_ACCOUNT` | `VARCHAR(60)`   | Max 60 characters                                 |
| `TYPE_NAME_CATEGORY`| `VARCHAR(20)`   | Must be uppercase                                 |
| `TYPE_NAME_FILE`    | `VARCHAR(60)`   | Max 60 characters                                 |
| `TYPE_FILE_TYPE`    | enum            | Currently `pdf`                                   |

## Functions

### Accounts

**`ACCOUNT_LOGIN`** — authenticates a user and creates a session.

| Parameter    | Type            |
| ------------ | --------------- |
| `p_email`    | `TYPE_EMAIL`    |
| `p_password` | `TYPE_PASSWORD` |

Returns: `TYPE_ID` — the new session id (`SESS...`).

Errors: `50001`, `50008`.

---

**`ACCOUNT_INSERT`** — creates a new account.

| Parameter    | Type            |
| ------------ | --------------- |
| `p_name`     | `TYPE_NAME_ACCOUNT` |
| `p_email`    | `TYPE_EMAIL`    |
| `p_phone`    | `TYPE_PHONE`    |
| `p_password` | `TYPE_PASSWORD` |

Returns: `TYPE_ID` — the new account id (`ACNT...`).

Errors: `50001`, `50002`.

---

**`ACCOUNT_RETRIEVE`** — retrieves an account's details and creation time.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns a table:

| Column           | Type                 |
| ---------------- | -------------------- |
| `account_email`  | `TYPE_EMAIL`         |
| `account_name`   | `TYPE_NAME_ACCOUNT`  |
| `account_phone`  | `TYPE_PHONE`         |
| `YEAR`           | `INTEGER`            |
| `MONTH`          | `INTEGER`            |
| `DAY`            | `INTEGER`            |
| `HOUR`           | `INTEGER`            |
| `MINUTE`         | `INTEGER`            |
| `SECOND`         | `INTEGER`            |
| `gmt`            | `CHAR(3)`            |

Errors: `50001`, `50006`.

---

**`UPDATE_ACCOUNT`** — updates an account's name, email and/or phone.

| Parameter      | Type                 |
| -------------- | -------------------- |
| `p_account_id` | `TYPE_ID`            |
| `p_name`       | `TYPE_NAME_ACCOUNT`  |
| `p_email`      | `TYPE_EMAIL`         |
| `p_phone`      | `TYPE_PHONE`         |

`p_name`, `p_email` and `p_phone` are optional; null fields keep the current
value. At least one field must be provided.

Returns: `TYPE_ID` — the updated account id (`ACNT...`).

Errors: `50001`, `50002`, `50004`, `50006`.

---

### Sessions

**`SESSION_CHECK`** — validates a session and refreshes its expiry.

| Parameter      | Type       |
| -------------- | ---------- |
| `p_session_id` | `TYPE_ID`  |

Returns: `TYPE_ID` — the owner account id (`ACNT...`), or `NULL` for null or
expired sessions.

Errors: `50006`.

---

### Cards

**`CARD_INSERT`** — creates a card from two components.

| Parameter     | Type      |
| ------------- | --------- |
| `p_frontside` | `TYPE_ID` |
| `p_backside`  | `TYPE_ID` |
| `p_creator`   | `TYPE_ID` |

Returns: `TYPE_ID` — the new card id (`CARD...`).

Errors: `50001`, `50003`, `50006`.

---

**`CARD_LIST`** — lists the cards owned by an account (front side text).

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns a table:

| Column           | Type     |
| ---------------- | -------- |
| `card_id`        | `TYPE_ID`|
| `component_text` | `TEXT`   |

Errors: `50001`, `50006`.

---

**`CARD_RETRIEVE`** — retrieves the front and back side text of cards.

| Parameter | Type        |
| --------- | ----------- |
| `p_ids`   | `TYPE_ID[]` |

Returns a table:

| Column           | Type     |
| ---------------- | -------- |
| `card_id`        | `TYPE_ID`|
| `frontside_text` | `TEXT`   |
| `backside_text`  | `TEXT`   |

Errors: `50001`, `50006`.

---

### Categories

**`CATEGORY_INSERT`** — creates a category owned by an account, or returns the
existing one if the account already has a category with the same name.

| Parameter | Type      |
| --------- | --------- |
| `p_owner` | `TYPE_ID` |
| `p_name`  | `TEXT`    |

`p_owner` is required and must reference an existing account. `p_name` must be
uppercase (enforced by the `TYPE_NAME_CATEGORY` domain) and at most 20
characters. Category names are unique per owner. (A `NULL` encounter is only for
categories the system adds automatically, not for the protocol.)

Returns: `TYPE_ID` — the category id (`CATE...`).

Errors: `50001`, `50002`, `50004`, `50006`.

---

**`CATEGORY_LIST`** — lists the categories of an account with card counts.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns a table:

| Column         | Type             |
| -------------- | ---------------- |
| `category_id`  | `TYPE_ID`        |
| `category_name`| `TYPE_NAME_CATEGORY` |
| `numOfCard`    | `INT`            |
| `YEAR`         | `INTEGER`        |
| `MONTH`        | `INTEGER`        |
| `DAY`          | `INTEGER`        |
| `HOUR`         | `INTEGER`        |
| `MINUTE`       | `INTEGER`        |
| `SECOND`       | `INTEGER`        |
| `gmt`          | `CHAR(3)`        |

Errors: `50001`, `50006`.

---

**`CATEGORY_RETRIEVE`** — retrieves a single category with its card ids.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_id`         | `TYPE_ID` |

Returns a table:

| Column         | Type             |
| -------------- | ---------------- |
| `category_name`| `TYPE_NAME_CATEGORY` |
| `numOfCard`    | `INT`            |
| `card_ids`     | `TYPE_ID[]`      |
| `YEAR`         | `INTEGER`        |
| `MONTH`        | `INTEGER`        |
| `DAY`          | `INTEGER`        |
| `HOUR`         | `INTEGER`        |
| `MINUTE`       | `INTEGER`        |
| `SECOND`       | `INTEGER`        |
| `gmt`          | `CHAR(3)`        |

Errors: `50001`, `50006`.

---

**`CATEGORY_LOG_RELATED`** — lists an account's completed exam logs whose exams
belong to a given category.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_category_id`| `TYPE_ID` |

Returns a table:

| Column         | Type             |
| -------------- | ---------------- |
| `log_id`       | `TYPE_ID`        |
| `exam_name`    | `TYPE_NAME_EXAM` |
| `score`        | `INT`            |
| `total_score`  | `INT`            |
| `YEAR_START`   | `INTEGER`        |
| `MONTH_START`  | `INTEGER`        |
| `DAY_START`    | `INTEGER`        |
| `HOUR_START`   | `INTEGER`        |
| `MINUTE_START` | `INTEGER`        |
| `SECOND_START` | `INTEGER`        |
| `GMT_START`    | `CHAR(3)`        |
| `YEAR_END`     | `INTEGER`        |
| `MONTH_END`    | `INTEGER`        |
| `DAY_END`      | `INTEGER`        |
| `HOUR_END`     | `INTEGER`        |
| `MINUTE_END`   | `INTEGER`        |
| `SECOND_END`   | `INTEGER`        |
| `GMT_END`      | `CHAR(3)`        |

The `_START`/`_END` columns are the `FN_GET_GMT` split of the exam log's
`start_time`/`end_time`.

Errors: `50001`, `50004`, `50006`.

---

### Components

**`COMPONENT_INSERT`** — creates a component owned by an account.

| Parameter | Type      |
| --------- | --------- |
| `p_text`  | `TEXT`    |
| `p_owner` | `TYPE_ID` |

Returns: `TYPE_ID` — the new component id (`COMP...`).

Errors: `50001`, `50004`, `50006`.

---

**`COMPONENT_RETRIEVE`** — finds a component by its exact text.

| Parameter | Type    |
| --------- | ------- |
| `p_text`  | `TEXT`  |

Returns: `TYPE_ID` — the component id (`COMP...`).

Errors: `50001`, `50004`, `50007`.

---

### Files

**`FILE_INSERT`** — creates a file record owned by an account.

| Parameter       | Type             |
| --------------- | ---------------- |
| `p_file_source` | `TEXT`           |
| `p_file_name`   | `TEXT`           |
| `p_hash_code`   | `TEXT`           |
| `p_file_type`   | `TYPE_FILE_TYPE` |
| `p_owner_id`    | `TYPE_ID`        |

`p_file_name` must be at most 60 characters (store as `TYPE_NAME_FILE`).
`p_hash_code` is the SHA-256 hash of the file, supplied by the backend; it must
be at most 64 characters and is stored as `CHAR(64)`. `p_file_type` is an enum
(`TYPE_FILE_TYPE`), currently `pdf`. `p_owner_id` must reference an existing
account.

Returns: `TYPE_ID` — the new file id (`FILE...`).

Errors: `50001`, `50002`, `50004`, `50006`.

---

### Request logs

**`REQUEST_LOG_INSERT`** — records an incoming request and its response.

| Parameter          | Type        |
| ------------------ | ----------- |
| `p_endpoint`       | `VARCHAR(60)` |
| `p_header`         | `TEXT`      |
| `p_body`           | `TEXT`      |
| `p_reponse_header` | `TEXT`      |
| `p_reponse_body`   | `TEXT`      |

Returns: `INT` — the new request id.

Errors: `50001`, `50002`.

---

### Exams

**`EXAM_CREATE`** — creates an exam from all reviewable cards in a category.

| Parameter      | Type      |
| -------------- | --------- |
| `p_category_id`| `TYPE_ID` |

Returns: `TYPE_ID` — the new exam id (`EXAM...`).

Errors: `50001`, `50004`, `50006`.

---

**`EXAM_START`** — starts an exam session, creating an exam log for an active
session.

| Parameter      | Type      |
| -------------- | --------- |
| `p_session_id` | `TYPE_ID` |
| `p_exam_id`    | `TYPE_ID` |

Returns: `TYPE_ID` — the new exam log id (`LOG...`).

Errors: `50001`, `50004`, `50005`, `50006`.

---

**`EXAM_REVIEW_RETRIEVE`** — retrieves the review questions of an exam.

| Parameter  | Type      |
| ---------- | --------- |
| `p_exam_id`| `TYPE_ID` |

Returns a table:

| Column         | Type        |
| -------------- | ----------- |
| `quiz_id`      | `TYPE_ID`   |
| `frontSide`    | `TEXT`      |
| `backSide`     | `TEXT`      |
| `YEAR`         | `INTEGER`   |
| `MONTH`        | `INTEGER`   |
| `DAY`          | `INTEGER`   |
| `HOUR`         | `INTEGER`   |
| `MINUTE`       | `INTEGER`   |
| `SECOND`       | `INTEGER`   |
| `gmt`          | `CHAR(3)`   |

Errors: `50001`, `50004`, `50006`.
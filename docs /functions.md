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
| `TYPE_FILE_TYPE`    | enum            | `pdf`, `png`, `jpg`, `bmp`, `ico`, `webp`         |
| `TYPE_CARD_INSERT`  | composite       | `(frontSide_id TYPE_ID, backSide_id TYPE_ID)`     |

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

| Column                 | Type                 |
| ---------------------- | -------------------- |
| `account_email`        | `TYPE_EMAIL`         |
| `account_name`         | `TYPE_NAME_ACCOUNT`  |
| `account_phone`        | `TYPE_PHONE`         |
| `account_daily_goal`   | `INTEGER`            |
| `YEAR`           | `INTEGER`            |
| `MONTH`          | `INTEGER`            |
| `DAY`            | `INTEGER`            |
| `HOUR`           | `INTEGER`            |
| `MINUTE`         | `INTEGER`            |
| `SECOND`         | `INTEGER`            |
| `gmt`            | `CHAR(3)`            |

Errors: `50001`, `50006`.

---

**`ACCOUNT_AVATAR_RETRIEVE`** — retrieves the file id of an account's avatar.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns: `TYPE_ID` — the avatar's file id (`FILE...`), or `NULL` if the account
has no avatar.

Errors: `50001`, `50004`, `50006`.

---

**`UPDATE_ACCOUNT`** — updates an account's name, email, phone, avatar and/or
daily goal.

| Parameter       | Type                 |
| --------------- | -------------------- |
| `p_account_id`  | `TYPE_ID`            |
| `p_name`        | `TYPE_NAME_ACCOUNT`  |
| `p_email`       | `TYPE_EMAIL`         |
| `p_phone`       | `TYPE_PHONE`         |
| `p_avatar`      | `TYPE_ID`            |
| `p_daily_goal`  | `INTEGER`            |

`p_name`, `p_email`, `p_phone`, `p_avatar` and `p_daily_goal` are optional; null
fields keep the current value. At least one field must be provided. When set,
`p_avatar` must be a `FILE...` id (`FILE` prefix) referencing an existing file.

Returns: `TYPE_ID` — the updated account id (`ACNT...`).

Errors: `50001`, `50002`, `50004`, `50006`.

---

**`ACCOUNT_LOGOUT`** — ends the active session(s) of an account.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns: nothing (`void`).

Errors: `50001`, `50005`, `50006`.

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

**`CARD_INSERT`** — creates one or more cards, each from a front and back side.

Single-card overload:

| Parameter     | Type      |
| ------------- | --------- |
| `p_frontside` | `TYPE_ID` |
| `p_backside`  | `TYPE_ID` |
| `p_creator`   | `TYPE_ID` |

Returns: `TYPE_ID` — the new card id (`CARD...`).

Batch overload:

| Parameter   | Type                |
| ----------- | ------------------- |
| `p_cards`   | `TYPE_CARD_INSERT[]`|
| `p_owner`   | `TYPE_ID`           |

Each element of `p_cards` is `(frontSide_id, backSide_id)`, both `COMP...` ids.
Returns a table of the card ids of every card created (or already existing for
the same front/back pair):

| Column    | Type      |
| --------- | --------- |
| `card_id` | `TYPE_ID` |

Errors: `50001`, `50003`, `50004`, `50006`.

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

**`CARD_DELETE`** — removes a card, or just un-owns it if the account is not its
creator.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_card_id`    | `TYPE_ID` |

Behavior depends on the account's relationship to the card:

- If the account **created** the card (`CARD.creator_id`), the card is deleted
  entirely: its `ACCOUNT_CARD_HAVE` rows, `CATEGORY_CARD_CONTAIN` links, review
  quizzes (and their `QUIZ`, `EXAM_QUIZ`, `QUES4A_QUIZ`/`FILLBLANK_QUIZ`, and
  `EXAM_LOG_REVIEW_RESULT` rows) are removed. The mastery of the account's
  followed categories that contained the card is recomputed.
- Otherwise the account only **un-haves** it: just this account's
  `ACCOUNT_CARD_HAVE` row is removed, and the mastery of the account's followed
  categories that contained the card is recomputed; the card itself is kept.

Returns: `void`. Errors: `50001`, `50004`, `50006`.

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

**`CATEGORY_FOLLOW`** — follows a category for an account: creates the follow row,
grants all cards in the category to the account, and computes the initial
`mastery_score`.

| Parameter       | Type      |
| --------------- | --------- |
| `p_account_id`  | `TYPE_ID` |
| `p_category_id` | `TYPE_ID` |

Returns: nothing (`void`).

Errors: `50001`, `50004`, `50006`.

---

**`CATEGORY_TO_CARD_CATEGORIZE`** — assigns a card to one or more categories.

| Parameter       | Type        |
| --------------- | ----------- |
| `p_card_id`     | `TYPE_ID`   |
| `p_category_ids`| `TYPE_ID[]` |

Returns: nothing (`void`).

Errors: `50001`, `50004`, `50006`.

---

**`CARD_TO_CATEGORY_CATEGORIZE`** — assigns one or more cards to a category.

| Parameter       | Type        |
| --------------- | ----------- |
| `p_category_id` | `TYPE_ID`   |
| `p_card_ids`    | `TYPE_ID[]` |

Returns: nothing (`void`).

Errors: `50001`, `50004`, `50006`.

---

**`CATEGORY_LIST`** — lists the categories **followed by** the account (from
`ACCOUNT_CATEGORY_FOLLOW`) with card counts and mastery.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns a table:

| Column         | Type             |
| -------------- | ---------------- |
| `category_id`  | `TYPE_ID`        |
| `category_name`| `TYPE_NAME_CATEGORY` |
| `numOfCard`    | `INT`            |
| `mastery`      | `FLOAT`          |
| `YEAR`         | `INTEGER`        |
| `MONTH`        | `INTEGER`        |
| `DAY`          | `INTEGER`        |
| `HOUR`         | `INTEGER`        |
| `MINUTE`       | `INTEGER`        |
| `SECOND`       | `INTEGER`        |
| `gmt`          | `CHAR(3)`        |

Only categories the account follows are returned. `mastery` is read directly from
`ACCOUNT_CATEGORY_FOLLOW.mastery_score` (it is not recomputed here); it is kept in
sync by the maintenance trigger on `ACCOUNT_CARD_HAVE` updates. `numOfCard` is the
category's stored card count (`CATEGORY.numOfCard`, maintained by a trigger on
`CATEGORY_CARD_CONTAIN`), not recomputed here. A followed category in which the
account has no cards still appears, with `numOfCard` 0.

Errors: `50001`, `50006`.

---

**`RECENT_CATEGORY_TAKE_LIST`** — lists the `n` most recent distinct categories
**followed by** the account (from `ACCOUNT_CATEGORY_FOLLOW`) that the account has
taken exams in, from the account's latest exam takes.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_n`          | `INT`     |

Returns a table:

| Column         | Type                 |
| -------------- | -------------------- |
| `category_id`  | `TYPE_ID`            |
| `category_name`| `TYPE_NAME_CATEGORY` |
| `mastery`      | `FLOAT`              |
| `YEAR`         | `INTEGER`            |
| `MONTH`        | `INTEGER`            |
| `DAY`          | `INTEGER`            |
| `HOUR`         | `INTEGER`            |
| `MINUTE`       | `INTEGER`            |
| `SECOND`       | `INTEGER`            |
| `gmt`          | `CHAR(3)`            |

Only categories the account follows appear. Categories are ordered by their most
recent exam take (descending). `date_created` here is the timestamp of the
category's latest take. The timestamp columns are the `FN_GET_GMT` split of that
take time. A `p_n <= 0` returns an empty result. `mastery` is read directly from
`ACCOUNT_CATEGORY_FOLLOW.mastery_score`.

Errors: `50001`, `50004`, `50006`.

---

**`CATEGORY_RETRIEVE`** — retrieves a single followed category with its card ids.

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
| `mastery`      | `FLOAT`          |
| `YEAR`         | `INTEGER`        |
| `MONTH`        | `INTEGER`        |
| `DAY`          | `INTEGER`        |
| `HOUR`         | `INTEGER`        |
| `MINUTE`       | `INTEGER`        |
| `SECOND`       | `INTEGER`        |
| `gmt`          | `CHAR(3)`        |

Only a category the account follows is returned; a non-followed category yields an
empty result. `mastery` is read directly from `ACCOUNT_CATEGORY_FOLLOW.mastery_score`
(it is not recomputed here); it is kept in sync by the maintenance trigger on
`ACCOUNT_CARD_HAVE` updates. `numOfCard` is the category's stored card count
(`CATEGORY.numOfCard`, maintained by a trigger on `CATEGORY_CARD_CONTAIN`), not
recomputed here.

Errors: `50001`, `50006`.

---

**`CATEGORY_NOT_HAVE_CARD`** — lists the categories **owned by** the account
(`CATEGORY.owner_id`) that a given card does **not** belong to (the categories
still "available" for that card).

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_card_id`    | `TYPE_ID` |

Returns a table:

| Column          | Type                |
| --------------- | ------------------- |
| `category_id`   | `TYPE_ID`           |
| `category_name` | `TYPE_NAME_CATEGORY`|

The result is the account's **owned** categories (via `CATEGORY.owner_id`) minus any
containing the given card in `CATEGORY_CARD_CONTAIN`.

Errors: `50001`, `50004`, `50006`.

---

**`CATEGORY_DELETE`** — removes a category, or just unfollows it if the account is
not its owner.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_category_id`| `TYPE_ID` |

Behavior depends on the account's relationship to the category:

- If the account **owns** the category (`CATEGORY.owner_id`), the category is
  deleted entirely: its `CATEGORY_CARD_CONTAIN` links, every account's
  `ACCOUNT_CATEGORY_FOLLOW` row, and its `EXAM_CATEGORY_RELATED` links are
  removed. The linked `EXAM` rows themselves are kept.
- Otherwise the account only **unfollows** it: just this account's
  `ACCOUNT_CATEGORY_FOLLOW` row is removed; the category and its exams are kept.

Returns: `void`. Errors: `50001`, `50004`, `50006`.

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

**`COMPONENT_INSERT`** — creates one or more components owned by an account.

Single-component overload:

| Parameter | Type      |
| --------- | --------- |
| `p_text`  | `TEXT`    |
| `p_owner` | `TYPE_ID` |

Returns: `TYPE_ID` — the new component id (`COMP...`).

Batch overload:

| Parameter | Type        |
| --------- | ----------- |
| `p_text`  | `TEXT[]`    |
| `p_owner` | `TYPE_ID`   |

Returns a table of the component ids of every component created (or already
existing with the same text):

| Column          | Type      |
| --------------- | --------- |
| `component_id`  | `TYPE_ID` |

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
| `p_file_name`   | `TEXT`           |
| `p_hash_code`   | `TEXT`           |
| `p_file_type`   | `TYPE_FILE_TYPE` |
| `p_owner_id`    | `TYPE_ID`        |

`p_file_name` must be at most 60 characters (store as `TYPE_NAME_FILE`).
`p_hash_code` is the SHA-256 hash of the file, supplied by the backend; it must
be at most 64 characters and is stored as `CHAR(64)`. `p_file_type` is an enum
(`TYPE_FILE_TYPE`): `pdf`, `png`, `jpg`, `bmp`, `ico`, `webp`. `p_owner_id` must
reference an existing account.

Returns a single-row table with two columns:

| Return column | Type      | Description                                            |
| ------------- | --------- | ------------------------------------------------------ |
| `file_id`     | `TYPE_ID` | The new file id (`FILE...`).                          |
| `file_source` | `TEXT`    | Derived storage key: `file_id || md5(hash_code || file_name) || '.' || file_type`. |

`file_source` is generated by the database, not supplied by the caller. The
leading `file_id` already guarantees uniqueness, so the fast `md5()` is used
rather than the full SHA-256 of the content.

Errors: `50001`, `50002`, `50004`, `50006`.

---

**`FILE_RETRIEVE`** — retrieves a file record by its id.

| Parameter    | Type      |
| ------------ | --------- |
| `p_file_id`  | `TYPE_ID` |

Returns a table:

| Column        | Type                 |
| ------------- | -------------------- |
| `file_source` | `TEXT`               |
| `file_name`   | `TYPE_NAME_FILE`     |
| `file_type`   | `TYPE_FILE_TYPE`     |
| `file_id`     | `TYPE_ID`            |
| `YEAR`        | `INTEGER`            |
| `MONTH`       | `INTEGER`            |
| `DAY`         | `INTEGER`            |
| `HOUR`        | `INTEGER`            |
| `MINUTE`      | `INTEGER`            |
| `SECOND`      | `INTEGER`            |
| `gmt`         | `CHAR(3)`            |

Errors: `50001`, `50004`, `50006`.

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

---

**`EXAM_LOG_REVIEW_RESULT`** — records a user's answer to a review quiz on an
exam log.

| Parameter       | Type      |
| --------------- | --------- |
| `p_exam_log_id` | `TYPE_ID` |
| `p_quiz_id`     | `TYPE_ID` |
| `p_result`      | `BOOLEAN` |

Returns: nothing (`void`).

If a result for the same `(p_exam_log_id, p_quiz_id)` already exists, the
conflict is reported rather than ignored.

Errors: `50001`, `50003`, `50004`, `50006`.

---

**`EXAM_COMPLETED`** — finalizes an exam log: sets its end time, grades it by
counting the number of correctly answered (TRUE) review questions, updates the
`true_count`/`false_count` of each reviewed card in `ACCOUNT_CARD_HAVE`, and
recomputes the day's learned-card count in `DAILY_LOG`.

| Parameter       | Type      |
| --------------- | --------- |
| `p_exam_log_id` | `TYPE_ID` |

Returns: nothing (`void`).

Errors: `50001`, `50003`, `50004`, `50006`.

---

### Daily & Monthly Learning

**`DAILY_LEARNED_COUNT`** — returns the number of cards learned by an account on
a given date. A card is "learned" on a day when it was part of an exam on that
day, the user answered at least one of its review quizzes correctly, and the
card's mastery score *before* the exam was less than 1.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |
| `p_date`       | `DATE`    |

Returns: `INT` — the number of distinct cards learned on that date (0 if none).

Errors: `50001`, `50004`, `50006`.

---

**`MONTHLY_LEARNED_COUNT`** — returns the number of cards learned by an account
on each day from the first day of the current month to today.

| Parameter      | Type      |
| -------------- | --------- |
| `p_account_id` | `TYPE_ID` |

Returns a table:

| Column       | Type   |
| ------------ | ------ |
| `day`        | `DATE` |
| `card_count` | `INT`  |

Days with no exams return `card_count = 0`.

Errors: `50001`, `50004`, `50006`.
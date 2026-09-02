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
| `TYPE_ID`           | `CHAR(15)`      | `LENGTH(VALUE) = 15`; prefix defines entity: `ACNT`, `CARD`, `CATE`, `SESS`, `COMP` |
| `TYPE_EMAIL`        | `citext`        | Valid email pattern                               |
| `TYPE_PASSWORD`     | `CHAR(100)`     | Max 100 characters                                |
| `TYPE_NAME_ACCOUNT` | `VARCHAR(60)`   | Max 60 characters                                 |
| `TYPE_NAME_CATEGORY`| `VARCHAR(20)`   | Must be uppercase                                 |

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
# Endpoints

A summary of all endpoints in the Snap2Card API v1.0.

Base URL: `/snap2card/api/v1.0`

## Summary

| Method | Path             | Auth        | Description                                        | Protocol                                  |
| ------ | ---------------- | ----------- | -------------------------------------------------- | ----------------------------------------- |
| POST   | `/account/login` | None        | Authenticates a user and returns an access token.  | [Account Login](../protocols/account-login.md) |
| POST   | `/account/register` | None     | Creates a new account.                             | [Account Register](../protocols/account-register.md) |
| GET    | `/account`       | Bearer token | Retrieves the authenticated user's account details. | [Account Retrieve](../protocols/account-retrieve.md) |
| PUT    | `/account`       | Bearer token | Updates the authenticated user's account details.  | [Account Edit](../protocols/account-edit.md) |
| POST   | `/account/logout` | Bearer token | Invalidates the current user's session/token.      | [Account Logout](../protocols/account-logout.md) |
| GET    | `/activities`    | Bearer token | Retrieves activity history for the authenticated user. | [Activities Retrieve](../protocols/activies-retrieve.md) |
| POST   | `/cards/pdf`     | Bearer token | Saves a PDF file and records it in the database. | [Card Create PDF](../protocols/card-create-pdf.md) |
| POST   | `/cards/document` | Bearer token | Creates a new card from a text document. | [Card Create Document](../protocols/card-create-document.md) |
| POST   | `/cards/manual`  | Bearer token | Creates a new card from front/back text manually. | [Card Create Manual](../protocols/card-create-manual.md) |
| PUT    | `/cards`         | Bearer token | Updates an existing card for the authenticated user. | [Card Edit](../protocols/card-edit.md) |
| GET    | `/cards/list`    | Bearer token | Lists the cards for the authenticated user.        | [Card List](../protocols/card-list.md) |
| GET    | `/cards`         | Bearer token | Retrieves one or more cards for the authenticated user. | [Card Retrieve](../protocols/card-retrieve.md) |
| PUT    | `/categories`    | Bearer token | Updates an existing category for the authenticated user. | [Category Edit](../protocols/category-edit.md) |
| POST   | `/categories`    | Bearer token | Creates a new category for the authenticated user. | [Category Create](../protocols/category-create.md) |
| GET    | `/categories/list` | Bearer token | Lists the categories for the authenticated user. | [Category List](../protocols/category-list.md) |
| GET    | `/categories`    | Bearer token | Retrieves a single category with its cards for the authenticated user. | [Category Retrieve](../protocols/category-retrieve.md) |
| POST   | `/cards/categorize` | Bearer token | Assigns a card to one or more categories. | [Category To Card](../protocols/category-to-card.md) |
| POST   | `/categories/categorize` | Bearer token | Assigns one or more cards to a category. | [Card To Category](../protocols/card-to-category.md) |
| GET    | `/categories/logs` | Bearer token | Lists completed exam logs for a category. | [Category Log Related](../protocols/category-log-related.md) |
| GET    | `/history`       | Bearer token | Retrieves the transaction/history log for the authenticated user. | [History Retrieve](../protocols/history-retrive.md) |
| POST   | `/exams/create`  | Bearer token | Creates a new exam from a category.  | [Exam Create](../protocols/exam-create.md) |
| POST   | `/exams/start`   | Bearer token | Starts an exam session.              | [Exam Start](../protocols/exam-start.md) |
| POST   | `/exams/result`  | Bearer token | Saves a quiz result against an exam log. | [Exam Result](../protocols/exam-result.md) |
| GET    | `/exams/review`  | Bearer token | Retrieves the quizzes for reviewing an exam. | [Exam Review](../protocols/exam-review.md) |
| POST   | `/exams/completed` | Bearer token | Finalizes an exam log and grades the exam. | [Exam Completed](../protocols/exam-completed.md) |
| POST   | `/vocabulary/from-text` | Bearer token | Generates vocabulary cards from a text document. | [Vocabulary From Text](../protocols/vocabulary-from-text.md) |
| POST   | `/vocabulary/from-pdf` | Bearer token | Generates vocabulary cards from a PDF file. | [Vocabulary From PDF](../protocols/vocabulary-from-pdf.md) |

## Endpoint Details

### Account

| Endpoint                           | Function                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| `POST /account/login`              | Authenticates a user with email and password and returns a session token. |
| `POST /account/register`           | Creates a new account from name, email, phone and password. |
| `GET /account`                     | Retrieves the authenticated user's account details.         |
| `PUT /account`                     | Updates account details. The `type` field selects the field to update: `total`, `name`, `email`, or `phone`. |
| `POST /account/logout`             | Invalidates the current user's session/token.               |

### Activities

| Endpoint              | Function                                                       |
| --------------------- | -------------------------------------------------------------- |
| `GET /activities`     | Retrieves activity stats: streak, cards used this month, and a per-day count array. |

### Cards

| Endpoint              | Function                                                        |
| --------------------- | --------------------------------------------------------------- |
| `POST /cards/pdf`     | Saves a PDF file and records it via `FILE_INSERT`.                 |
| `POST /cards/document`| Creates a new card from a large text document.                     |
| `POST /cards/manual`  | Creates a new card from manually entered `frontSide`/`backSide`.   |
| `PUT /cards`          | Updates a card's front/back side text and its categories.       |
| `GET /cards/list`     | Lists all cards (id and front side text).                       |
| `GET /cards`          | Retrieves one or more cards by `ids`, or all when omitted.      |

### Categories

| Endpoint                  | Function                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `PUT /categories`         | Updates a category name.                                        |
| `POST /categories`        | Creates a new category from a name.                             |
| `GET /categories/list`    | Lists all categories (id, name, numOfCard, and createdAt). |
| `GET /categories`         | Retrieves a single category by `id`, including its `cardIds`. |
| `POST /cards/categorize`  | Assigns a card to one or more categories.                       |
| `POST /categories/categorize` | Assigns one or more cards to a category.                    |
| `GET /categories/logs`    | Lists completed exam logs whose exams belong to a category.     |

### History

| Endpoint             | Function                                                        |
| -------------------- | --------------------------------------------------------------- |
| `GET /history`       | Retrieves the transaction/history log with pagination (`from`, `to`, `limit`, `page`). |

### Exams

| Endpoint              | Function                                                        |
| --------------------- | --------------------------------------------------------------- |
| `POST /exams/create`  | Creates an exam from all reviewable cards in a category, returning the new exam id. |
| `POST /exams/start`   | Starts an exam session for an exam, returning a new exam log.    |
| `POST /exams/result`  | Records a user's answer to a review quiz on an exam log.         |
| `GET /exams/review`   | Retrieves the review questions (quizzes) of an exam.             |
| `POST /exams/completed` | Finalizes an exam log, setting its end time and grading it.    |

### Vocabulary

| Endpoint                     | Function                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| `POST /vocabulary/from-text` | Generates vocabulary cards from a text document.                |
| `POST /vocabulary/from-pdf`  | Generates vocabulary cards from a PDF file (multipart upload).  |

## Notes

- All endpoints except `POST /account/login` and `POST /account/register` require a `Bearer <token>` in the `Authorization` header.
- All endpoints require the appropriate `Content-Type` header (`application/json`, or `multipart/form-data` for PDF uploads). Missing/mismatched `Content-Type` returns `415 Unsupported Media Type`.
- Full request/response details for each endpoint are described in the [Protocols](../protocols/) directory.
- Shared object definitions are described in [Object Types](../definitions/object-types.md).
- Error codes and formats are described in [Error Codes](../definitions/errors.md).
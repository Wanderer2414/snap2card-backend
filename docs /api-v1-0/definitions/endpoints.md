# Endpoints

A summary of all endpoints in the Snap2Card API v1.0.

Base URL: `/snap2card/api/v1.0`

## Summary

| Method | Path             | Auth        | Description                                        | Protocol                                  |
| ------ | ---------------- | ----------- | -------------------------------------------------- | ----------------------------------------- |
| POST   | `/account/login` | None        | Authenticates a user and returns an access token.  | [Account Login](../protocols/account-login.md) |
| GET    | `/account`       | Bearer token | Retrieves the authenticated user's account details. | [Account Retrieve](../protocols/account-retrieve.md) |
| PUT    | `/account`       | Bearer token | Updates the authenticated user's account details.  | [Account Edit](../protocols/account-edit.md) |
| POST   | `/account/logout` | Bearer token | Invalidates the current user's session/token.      | [Account Logout](../protocols/account-logout.md) |
| GET    | `/activities`    | Bearer token | Retrieves activity history for the authenticated user. | [Activities Retrieve](../protocols/activies-retrieve.md) |
| POST   | `/cards`         | Bearer token | Creates a new card for the authenticated user.     | [Card Create](../protocols/card-create.md) |
| PUT    | `/cards`         | Bearer token | Updates an existing card for the authenticated user. | [Card Edit](../protocols/card-edit.md) |
| GET    | `/cards/list`    | Bearer token | Lists the cards for the authenticated user.        | [Card List](../protocols/card-list.md) |
| GET    | `/cards`         | Bearer token | Retrieves one or more cards for the authenticated user. | [Card Retrieve](../protocols/card-retrieve.md) |
| PUT    | `/categories`    | Bearer token | Updates an existing category for the authenticated user. | [Category Edit](../protocols/category-edit.md) |
| GET    | `/categories/list` | Bearer token | Lists the categories for the authenticated user. | [Category List](../protocols/category-list.md) |
| GET    | `/categories`    | Bearer token | Retrieves a single category with its cards for the authenticated user. | [Category Retrieve](../protocols/category-retrieve.md) |
| GET    | `/history`       | Bearer token | Retrieves the transaction/history log for the authenticated user. | [History Retrieve](../protocols/history-retrive.md) |

## Endpoint Details

### Account

| Endpoint                           | Function                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| `POST /account/login`              | Authenticates a user with email and password and returns a session token. |
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
| `POST /cards`         | Creates a new card. The `type` field selects the data source: `document`, `image`, or `manual`. |
| `PUT /cards`          | Updates a card's front/back side text and its categories.       |
| `GET /cards/list`     | Lists all cards (id and front side text).                       |
| `GET /cards`          | Retrieves one or more cards by `ids`, or all when omitted.      |

### Categories

| Endpoint                  | Function                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `PUT /categories`         | Updates a category name.                                        |
| `GET /categories/list`    | Lists all categories (id, name, numOfCard, and createdAt). |
| `GET /categories`         | Retrieves a single category by `id`, including its `cardIds`. |

### History

| Endpoint             | Function                                                        |
| -------------------- | --------------------------------------------------------------- |
| `GET /history`       | Retrieves the transaction/history log with pagination (`from`, `to`, `limit`, `page`). |

## Notes

- All endpoints except `POST /account/login` require a `Bearer <token>` in the `Authorization` header.
- Full request/response details for each endpoint are described in the [Protocols](../protocols/) directory.
- Shared object definitions are described in [Object Types](../definitions/object-types.md).
- Error codes and formats are described in [Error Codes](../definitions/errors.md).
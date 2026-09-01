# Object Types

Shared object definitions used across the API protocols.

## Time

Represents a point in time, broken down into its individual components.

### Example

```json
{
  "year": 2026,
  "month": 1,
  "day": 1,
  "hour": 0,
  "minute": 0,
  "second": 0,
  "gmt": "+00:00"
}
```

### Fields

| Field    | Type   | Description                               |
| -------- | ------ | ----------------------------------------- |
| `year`   | number | Year.                                     |
| `month`  | number | Month (1-12).                             |
| `day`    | number | Day (1-31).                               |
| `hour`   | number | Hour (0-23).                              |
| `minute` | number | Minute (0-59).                            |
| `second` | number | Second (0-59).                            |
| `gmt`    | string | GMT offset (e.g. `+00:00`).               |

## Image

Represents an image used as input. An image may be embedded within text, either as a URL, a base64 data URI, or raw binary data. Only PNG images are supported.

### Example

```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "mimeType": "image/png"
}
```

### Fields

| Field      | Type   | Description                                                       |
| ---------- | ------ | ----------------------------------------------------------------- |
| `image`    | string | The image content: a URL, a base64 data URI, or raw binary data.  |
| `mimeType` | string | MIME type of the image. Must be `image/png`.                      |

## ID

Any identifier used across the API follows the format `<typeCode><id>`, where `typeCode` is a short code identifying the entity type and `id` is the unique identifier value.

### Format

```
<typeCode><id>
```

### Example

```
CARD1234567890
```

### Types

Each ID type has an explicit `typeCode` prefix. The full identifier is always `<typeCode><id>`.

| ID Type       | typeCode | Format          | Example          |
| ------------- | -------- | --------------- | ---------------- |
| `userId`      | `USR`    | `USR<id>`       | `USR1234567890`  |
| `historyId`   | `HIS`    | `HIS<id>`       | `HIS1234567890`  |
| `activityId`  | `ACT`    | `ACT<id>`       | `ACT1234567890`  |
| `categoryId`  | `CAT`    | `CAT<id>`       | `CAT1234567890`  |
| `cardId`      | `CARD`   | `CARD<id>`      | `CARD1234567890` |

## Category

Represents a category.

### Example

```json
{
  "id": "CAT1234567890",
  "name": "Banking",
  "numOfCard": 12,
  "createdAt": {
    "year": 2026,
    "month": 1,
    "day": 1,
    "hour": 0,
    "minute": 0,
    "second": 0,
    "gmt": "+00:00"
  },
  "cardIds": [
    "CARD1234567890",
    "CARD2345678901"
  ]
}
```

### Fields

| Field       | Type   | Description                                   |
| ----------- | ------ | --------------------------------------------- |
| `id`        | [ID](../definitions/object-types.md#id) | Unique identifier of the category.       |
| `name`      | string | Name of the category.                         |
| `numOfCard` | number | Number of cards in the category.              |
| `createdAt` | [Time](../definitions/object-types.md#time) | Timestamp when the first card was added to the category. |
| `cardIds`   | array  | List of [Card IDs](../definitions/object-types.md#id) belonging to the category. |

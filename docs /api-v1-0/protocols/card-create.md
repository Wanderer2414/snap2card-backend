# Card Create

Creates a new card for the authenticated user.

- **Method:** `POST`
- **Endpoint:** `/snap2card/api/v1.0/cards`
- **Auth:** Bearer token

## Request

### Headers

| Header | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `Authorization` | string | Yes | `Bearer <token>` |
| `Content-Type` | string | Yes | `application/json` |

### Body

```json
{
  "name": "My Card",
  "type": "manual",
  "text": "Full card details text",
  "image": {
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "mimeType": "image/png"
  },
  "frontSide": "Front card text",
  "backSide": "Back card text"
}
```

### Parameters

| Field        | Type   | Required | Description                                                  |
| ------------ | ------ | -------- | ------------------------------------------------------------ |
| `name`       | string | Yes      | Name of the card.                                            |
| `type`       | string | Yes      | Creation type: `document`, `image`, or `manual`.      |
| `text`       | string | No       | Large text input (used when `type` is `document`).        |
| `image`      | [Image](../definitions/object-types.md#image) | No | Image input (used when `type` is `image`).        |
| `frontSide`  | string | No       | Front side text (used when `type` is `manual`).             |
| `backSide`   | string | No       | Back side text (used when `type` is `manual`).              |

## Create by Type

The `type` field determines how the card data is provided.

### Type `document`

Card details are provided as a large text input.

```json
{
  "name": "My Card",
  "type": "document",
  "text": "Full card details text"
}
```

### Type `image`

Card details are provided as an image.

```json
{
  "name": "My Card",
  "type": "image",
  "image": {
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "mimeType": "image/png"
  }
}
```

### Type `manual`

Card details are entered manually via front side and back side text.

```json
{
  "name": "My Card",
  "type": "manual",
  "frontSide": "Front card text",
  "backSide": "Back card text"
}
```

## Response

### 201 Created

```json
{
  "status": "success",
  "data": {
    "id": "CARD1234567890"
  }
}
```

### Response Parameters

| Field         | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| `id`          | [Card ID](../definitions/object-types.md#id) | Unique identifier of the card.                |

## Errors

See [Error Codes](../definitions/errors.md) for the full description and format of each error.

| Code | Error                  |
| ---- | ---------------------- |
| 400  | Bad Request |
| 500  | Internal Server Error |
| 426  | Version Mismatch |

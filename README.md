# Snap2Card Backend

A Node.js/TypeScript backend for the Snap2Card flashcard application. Provides REST API endpoints for accounts, cards, categories, exams, and AI-powered vocabulary generation via OpenAI.

## Prerequisites

- **Node.js** >= 18
- **Python 3** with [PyMuPDF](https://pymupdf.readthedocs.io/) (for PDF text extraction)
- **PostgreSQL** database

## Setup

```bash
git clone https://github.com/Wanderer2414/snap2card-backend.git
cd snap2card-backend
npm install
```

### Python environment (for PDF extraction)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Certs

The server starts over HTTPS and reads several secret/configuration files from the
`certs/` directory. **This directory is gitignored** — you must create the files
yourself.

Create the `certs/` directory and populate each file with its value:

```bash
mkdir -p certs
```

| File | Contents | Example |
|---|---|---|
| `certs/server.key` | TLS private key (PEM) | Generated via `openssl` (see below) |
| `certs/server.crt` | TLS certificate (PEM) | Generated via `openssl` (see below) |
| `certs/postgres_password.txt` | PostgreSQL password for the `snap2card` user | `mysecretpassword` |
| `certs/port.txt` | HTTPS listen port (integer) | `3000` |
| `certs/openai_api_key.txt` | OpenAI API key (for vocabulary generation) | `sk-...` |
| `certs/llm_model.txt` | LLM model name (defaults to `gpt-4o-mini` if empty) | `gpt-4o-mini` |

### Generate a self-signed TLS certificate (dev only)

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -subj "/CN=localhost"
```

### Example certs setup

```bash
echo -n "mysecretpassword" > certs/postgres_password.txt
echo -n "3000"             > certs/port.txt
echo -n "sk-..."           > certs/openai_api_key.txt
echo -n "gpt-4o-mini"      > certs/llm_model.txt
chmod 600 certs/server.key certs/openai_api_key.txt certs/postgres_password.txt
```

## Environment Variables

Optional — copy `.env.example` and adjust:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `MAX_VOCABULARY_INPUT_CHARACTERS` | `12000` | Max characters sent to the LLM |
| `VOCABULARY_LLM_TIMEOUT_MS` | `30000` | LLM request timeout in ms |
| `SNAP2CARD_SKIP_REQUEST_LOG` | — | Set to `1` to disable request logging to DB |
| `PYTHON_BIN` | auto-detected | Path to Python binary (used by PDF extraction) |

## Database

The server connects to a local PostgreSQL instance:

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| User | `snap2card` |
| Database | `snap2card` |
| Password | read from `certs/postgres_password.txt` |

Ensure the `snap2card` database and user exist and the required tables/functions
have been created (see `docs/functions.md` for the full function reference).

## Running

### Development (with hot reload)

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server starts on `https://[::]:<port>` using the TLS certificate and key
from `certs/`.

## Testing

```bash
npm test
```

Tests use Node's built-in test runner via `tsx`. Some tests require the Python
PDF extraction script to be available.

## Project Structure

```
src/
├── configs/          # error definitions, python config
├── controllers/      # HTTP router, database pool
├── definitions/      # response types and constructors
├── handlers/         # endpoint handlers (account, card, category, exam, vocabulary)
├── services/         # LLM client, PDF extraction, vocabulary generation
├── shared_functions/ # body parsing, auth, file storage, validation, etc.
├── shared_type/      # shared TypeScript types
└── index.ts          # entry point
```

## API Documentation

Full API documentation lives in `docs/api-v1-0/`:

- **Endpoints summary**: `docs/api-v1-0/definitions/endpoints.md`
- **Protocols**: `docs/api-v1-0/protocols/` (one file per endpoint)
- **DB functions**: `docs/functions.md`

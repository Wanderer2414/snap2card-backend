import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { LlmVocabularyClient, LlmVocabularyClientOptions } from "../src/services/llm_vocabulary_client.js";
import {
  setVocabularyGenerationServiceForTest,
  VocabularyGenerationService,
} from "../src/services/vocabulary_generation.js";

process.env.SNAP2CARD_SKIP_REQUEST_LOG = "1";

const python = process.env.PYTHON_BIN ?? (existsSync(".venv/bin/python") ? ".venv/bin/python" : "python3");
const createdCertPassword = !existsSync("certs/postgres_password.txt");
if (createdCertPassword) {
  mkdirSync("certs", { recursive: true });
  writeFileSync("certs/postgres_password.txt", "test-password");
}

const { router } = await import("../src/controllers/router.js");
const { handlers } = await import("../src/config.js");
if (createdCertPassword) rmSync("certs/postgres_password.txt", { force: true });

test("POST /vocabulary/from-pdf extracts PDF text and returns real-generation vocabulary schema", async () => {
  setVocabularyGenerationServiceForTest(new VocabularyGenerationService(new StaticVocabularyClient()));
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-route-test-"));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    const pdfPath = path.join(dir, "climate.pdf");
    createTextPdf(pdfPath, ["Climate change can exacerbate inequality. Vulnerable communities need mitigation strategies."]);
    await listen(server);

    const response = await postMultipart(server, readFileSync(pdfPath), "climate.pdf", "application/pdf", {
      level: "B1",
      count: "20",
      includePhrases: "true",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.data.source.type, "pdf");
    assert.equal(response.body.data.cards[0].term, "exacerbate");
    assert.equal(typeof response.body.data.cards[0].definition, "string");
    assert.equal(typeof response.body.data.cards[0].translation, "string");
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("POST /vocabulary/from-pdf accepts multi-page text PDF", async () => {
  setVocabularyGenerationServiceForTest(new VocabularyGenerationService(new StaticVocabularyClient()));
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-route-test-"));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    const pdfPath = path.join(dir, "multi.pdf");
    createTextPdf(pdfPath, [
      "First page contains climate adaptation vocabulary.",
      "Second page contains vulnerable communities and inequality vocabulary.",
    ]);
    await listen(server);

    const response = await postMultipart(server, readFileSync(pdfPath), "multi.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.data.source.type, "pdf");
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("POST /vocabulary/from-pdf accepts PDF with headings and paragraphs", async () => {
  setVocabularyGenerationServiceForTest(new VocabularyGenerationService(new StaticVocabularyClient()));
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-route-test-"));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    const pdfPath = path.join(dir, "structured.pdf");
    createTextPdf(pdfPath, [
      "Climate Change Overview\n\nClimate change refers to long-term shifts.\n\nMitigation strategies reduce future risk.",
    ]);
    await listen(server);

    const response = await postMultipart(server, readFileSync(pdfPath), "structured.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.data.source.type, "pdf");
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("POST /vocabulary/from-pdf rejects invalid file", async () => {
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postMultipart(server, Buffer.from("not a pdf"), "notes.txt", "text/plain", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Invalid PDF");
  } finally {
    server.close();
  }
});

test("POST /vocabulary/from-pdf rejects corrupted PDF", async () => {
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postMultipart(server, Buffer.from("%PDF-not actually valid"), "broken.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Invalid PDF");
  } finally {
    server.close();
  }
});

test("POST /vocabulary/from-pdf rejects non-PDF renamed with pdf extension", async () => {
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postMultipart(server, Buffer.from("plain text renamed"), "renamed.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Invalid PDF");
  } finally {
    server.close();
  }
});

test("POST /vocabulary/from-pdf rejects empty PDF upload", async () => {
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postMultipart(server, Buffer.alloc(0), "empty.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Empty PDF");
  } finally {
    server.close();
  }
});

test("POST /vocabulary/from-pdf rejects scanned PDF with no readable text", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-route-test-"));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    const pdfPath = path.join(dir, "scanned.pdf");
    createImageOnlyPdf(pdfPath);
    await listen(server);

    const response = await postMultipart(server, readFileSync(pdfPath), "scanned.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "PDF does not contain enough readable text");
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("POST /vocabulary/from-pdf rejects too-large PDF", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-route-test-"));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    const pdfPath = path.join(dir, "large.pdf");
    createTextPdf(pdfPath, Array.from({ length: 11 }, (_, index) => `Page ${index + 1} contains readable text.`));
    await listen(server);

    const response = await postMultipart(server, readFileSync(pdfPath), "large.pdf", "application/pdf", {});

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "PDF exceeds the page or file size limit");
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

function listen(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}

class StaticVocabularyClient implements LlmVocabularyClient {
  async generateVocabulary(_prompt: string, _options: LlmVocabularyClientOptions): Promise<unknown> {
    return {
      cards: [
        {
          term: "exacerbate",
          definition: "To make a problem or bad situation worse.",
          translation: "làm trầm trọng thêm",
          partOfSpeech: "verb",
          example: "Pollution can exacerbate health problems.",
          sourceSentence: "Climate change can exacerbate inequality.",
          difficulty: "B1",
        },
      ],
    };
  }
}

function postMultipart(
  server: ReturnType<typeof createServer>,
  file: Buffer,
  filename: string,
  contentType: string,
  fields: Record<string, string>,
): Promise<{ statusCode: number; body: any }> {
  const boundary = `snap2card-${Date.now()}`;
  const body = buildMultipartBody(boundary, file, filename, contentType, fields);
  const port = (server.address() as AddressInfo).port;

  return new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1",
      port,
      path: "/snap2card/api/v1.0/vocabulary/from-pdf",
      method: "POST",
      headers: {
        Authorization: "Bearer 123456789012345",
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode ?? 0,
          body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
        });
      });
    });
    req.on("error", reject);
    req.end(body);
  });
}

function buildMultipartBody(
  boundary: string,
  file: Buffer,
  filename: string,
  contentType: string,
  fields: Record<string, string>,
): Buffer {
  const chunks: Buffer[] = [];
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  }
  chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`));
  chunks.push(file);
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

function createTextPdf(pdfPath: string, pages: string[]): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
for text in sys.argv[2:]:
    page = doc.new_page()
    page.insert_textbox(fitz.Rect(72, 72, 520, 760), text, fontsize=12)
doc.save(sys.argv[1])`,
    pdfPath,
    ...pages,
  ]);
}

function createImageOnlyPdf(pdfPath: string): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
page = doc.new_page()
page.draw_rect(fitz.Rect(72, 72, 400, 300), color=(0, 0, 0), fill=(0.9, 0.9, 0.9))
doc.save(sys.argv[1])`,
    pdfPath,
  ]);
}

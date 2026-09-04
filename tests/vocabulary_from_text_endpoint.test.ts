import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import type { LlmVocabularyClient, LlmVocabularyClientOptions } from "../src/services/llm_vocabulary_client.js";
import {
  setVocabularyGenerationServiceForTest,
  VocabularyGenerationService,
} from "../src/services/vocabulary_generation.js";

process.env.SNAP2CARD_SKIP_REQUEST_LOG = "1";

const createdCertPassword = !existsSync("certs/postgres_password.txt");
if (createdCertPassword) {
  mkdirSync("certs", { recursive: true });
  writeFileSync("certs/postgres_password.txt", "test-password");
}

const { router } = await import("../src/controllers/router.js");
const { handlers } = await import("../src/config.js");
if (createdCertPassword) rmSync("certs/postgres_password.txt", { force: true });

test("POST /vocabulary/from-text returns real-generation vocabulary schema", async () => {
  setVocabularyGenerationServiceForTest(new VocabularyGenerationService(new StaticVocabularyClient()));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postJson(server, {
      text: "Climate change can exacerbate existing inequalities.",
      level: "B1",
      count: 20,
      includePhrases: true,
      sourceType: "scan",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.data.source.type, "scan");
    assert.equal(response.body.data.cards[0].term, "exacerbate");
    assert.equal(typeof response.body.data.cards[0].definition, "string");
    assert.equal(typeof response.body.data.cards[0].translation, "string");
  } finally {
    server.close();
  }
});

test("POST /vocabulary/from-text maps provider failure to controlled error", async () => {
  setVocabularyGenerationServiceForTest(new VocabularyGenerationService(new EmptyVocabularyClient()));
  const server = createServer((req, res) => router.route(req, res, handlers));
  try {
    await listen(server);
    const response = await postJson(server, {
      text: "Climate change can exacerbate existing inequalities.",
      level: "B1",
      count: 20,
      includePhrases: true,
      sourceType: "scan",
    });

    assert.equal(response.statusCode, 502);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Vocabulary generation failed");
  } finally {
    server.close();
  }
});

function listen(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}

function postJson(
  server: ReturnType<typeof createServer>,
  payload: Record<string, unknown>,
): Promise<{ statusCode: number; body: any }> {
  const body = Buffer.from(JSON.stringify(payload));
  const port = (server.address() as AddressInfo).port;

  return new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1",
      port,
      path: "/snap2card/api/v1.0/vocabulary/from-text",
      method: "POST",
      headers: {
        Authorization: "Bearer 123456789012345",
        "Content-Type": "application/json",
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
          sourceSentence: "Climate change can exacerbate existing inequalities.",
          difficulty: "B1",
        },
      ],
    };
  }
}

class EmptyVocabularyClient implements LlmVocabularyClient {
  async generateVocabulary(_prompt: string, _options: LlmVocabularyClientOptions): Promise<unknown> {
    return { cards: [] };
  }
}

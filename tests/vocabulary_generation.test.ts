import test from "node:test";
import assert from "node:assert/strict";
import { VocabularyGeneration } from "../src/definitions/responses.js";
import { LlmProviderError, type LlmVocabularyClient, type LlmVocabularyClientOptions } from "../src/services/llm_vocabulary_client.js";
import {
  parseVocabularyFromTextRequest,
  postProcessVocabularyCards,
  vocabularyGenerationConfig,
  VocabularyGenerationService,
} from "../src/services/vocabulary_generation.js";

test("valid provider structured response returns success response with expected schema", async () => {
  const parsed = parseVocabularyFromTextRequest({
    text: "Climate change can exacerbate existing inequalities.",
    level: "B1",
    count: 20,
    includePhrases: true,
    sourceType: "scan",
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const result = await new VocabularyGenerationService(new StaticVocabularyClient(validProviderResponse())).generateFromText(parsed.request);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const response = VocabularyGeneration({ type: parsed.request.sourceType }, result.data);
  assert.equal(response.status, "success");
  assert.equal(response.data.source.type, "scan");
  assert.equal(response.data.cards[0]?.term, "exacerbate");
  assert.equal(typeof response.data.cards[0]?.definition, "string");
  assert.equal(typeof response.data.cards[0]?.translation, "string");
});

test("blank text is rejected", () => {
  const parsed = parseVocabularyFromTextRequest({ text: "   " });
  assert.equal(parsed.ok, false);
});

test("invalid count is rejected", () => {
  assert.equal(parseVocabularyFromTextRequest({ text: "valid", count: 0 }).ok, false);
  assert.equal(parseVocabularyFromTextRequest({ text: "valid", count: 51 }).ok, false);
  assert.equal(parseVocabularyFromTextRequest({ text: "valid", count: 1.5 }).ok, false);
});

test("invalid CEFR level is rejected", () => {
  const parsed = parseVocabularyFromTextRequest({ text: "valid", level: "B3" });
  assert.equal(parsed.ok, false);
});

test("provider duplicates are deduplicated case-insensitively", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate adaptation can reduce climate risk.", count: 5 });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const result = await new VocabularyGenerationService(new StaticVocabularyClient({
    cards: [
      card("Adaptation", "A change made to fit new conditions.", "sự thích nghi"),
      card("adaptation", "A duplicate should be removed.", "sự thích nghi"),
      card("mitigation", "Action that reduces harmful effects.", "sự giảm thiểu"),
    ],
  })).generateFromText(parsed.request);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.data.map((item) => item.term), ["Adaptation", "mitigation"]);
});

test("blank required provider fields are removed safely", () => {
  const cards = postProcessVocabularyCards({
    cards: [
      card("", "Definition", "translation"),
      card("valid term", "", "translation"),
      card("resilience", "The ability to recover after difficulty.", "khả năng phục hồi"),
    ],
  }, 10);

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.term, "resilience");
});

test("provider timeout maps to controlled temporary unavailable error with one retry", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate change can exacerbate existing inequalities." });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const client = new ThrowingVocabularyClient(new LlmProviderError("timeout"));
  const result = await new VocabularyGenerationService(client).generateFromText(parsed.request);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(client.calls, 2);
  assert.equal(result.error.code, 503);
  assert.equal(result.error.message, "Vocabulary generation is temporarily unavailable");
});

test("provider rate limit maps to controlled temporary unavailable error with one retry", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate change can exacerbate existing inequalities." });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const client = new ThrowingVocabularyClient(new LlmProviderError("rate-limit"));
  const result = await new VocabularyGenerationService(client).generateFromText(parsed.request);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(client.calls, 2);
  assert.equal(result.error.code, 503);
});

test("malformed provider output retries once and then fails safely", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate change can exacerbate existing inequalities." });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const client = new StaticVocabularyClient({ cards: [] });
  const result = await new VocabularyGenerationService(client).generateFromText(parsed.request);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(client.calls, 2);
  assert.equal(result.error.code, 502);
  assert.equal(result.error.message, "Vocabulary generation failed");
});

test("requested count is respected and clamped", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate mitigation adaptation resilience vulnerability.", count: 2 });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const result = await new VocabularyGenerationService(new StaticVocabularyClient({
    cards: [
      card("mitigation", "Action that reduces harm.", "sự giảm thiểu"),
      card("adaptation", "A change made to fit new conditions.", "sự thích nghi"),
      card("resilience", "The ability to recover.", "khả năng phục hồi"),
    ],
  })).generateFromText(parsed.request);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.length, 2);
});

test("input too large is rejected before provider call", async () => {
  const parsed = parseVocabularyFromTextRequest({
    text: "a".repeat(vocabularyGenerationConfig.maxInputCharacters + 1),
    count: 2,
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const client = new StaticVocabularyClient(validProviderResponse());
  const result = await new VocabularyGenerationService(client).generateFromText(parsed.request);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(client.calls, 0);
  assert.equal(result.error.code, 400);
  assert.equal(result.error.message, "Vocabulary input is too large");
});

test("missing API key maps to controlled configuration error", async () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate change can exacerbate existing inequalities." });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const result = await new VocabularyGenerationService(new ThrowingVocabularyClient(new LlmProviderError("missing-api-key")))
    .generateFromText(parsed.request);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, 503);
  assert.equal(result.error.message, "Vocabulary generation is temporarily unavailable");
});

function validProviderResponse(): unknown {
  return {
    cards: [
      card("exacerbate", "To make a problem or bad situation worse.", "làm trầm trọng thêm", "verb"),
      card("inequality", "An unfair difference between groups of people.", "sự bất bình đẳng", "noun"),
    ],
  };
}

function card(term: string, definition: string, translation: string, partOfSpeech: string | null = null): Record<string, string | null> {
  return {
    term,
    definition,
    translation,
    partOfSpeech,
    example: "This is a natural example sentence.",
    sourceSentence: "Climate change can exacerbate existing inequalities.",
    difficulty: "B1",
  };
}

class StaticVocabularyClient implements LlmVocabularyClient {
  calls = 0;

  constructor(private readonly response: unknown) {}

  async generateVocabulary(_prompt: string, _options: LlmVocabularyClientOptions): Promise<unknown> {
    this.calls += 1;
    return this.response;
  }
}

class ThrowingVocabularyClient implements LlmVocabularyClient {
  calls = 0;

  constructor(private readonly error: Error) {}

  async generateVocabulary(_prompt: string, _options: LlmVocabularyClientOptions): Promise<unknown> {
    this.calls += 1;
    throw this.error;
  }
}

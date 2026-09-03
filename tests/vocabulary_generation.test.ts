import test from "node:test";
import assert from "node:assert/strict";
import { VocabularyGeneration } from "../src/definitions/responses.js";
import {
  parseVocabularyFromTextRequest,
  VocabularyGenerationService,
} from "../src/services/vocabulary_generation.js";

test("valid request returns success response with expected schema", () => {
  const parsed = parseVocabularyFromTextRequest({
    text: "Climate change can exacerbate existing inequalities.",
    level: "B1",
    count: 20,
    includePhrases: true,
    sourceType: "scan",
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const cards = new VocabularyGenerationService().generateFromText(parsed.request);
  const response = VocabularyGeneration({ type: parsed.request.sourceType }, cards);

  assert.equal(response.status, "success");
  assert.equal(response.data.source.type, "scan");
  assert.ok(Array.isArray(response.data.cards));
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

test("mock result is deterministic", () => {
  const parsed = parseVocabularyFromTextRequest({ text: "Climate text", count: 3 });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const service = new VocabularyGenerationService();
  const first = service.generateFromText(parsed.request);
  const second = service.generateFromText(parsed.request);

  assert.deepEqual(first, second);
  assert.deepEqual(first.map((card) => card.term), ["exacerbate", "inequality", "vulnerable"]);
});

import type { ApiError } from "../configs/errors.js";
import { errors } from "../configs/errors.js";
import {
  GeneratedVocabularyCard,
  type GeneratedVocabularyCard as GeneratedVocabularyCardResponse,
  type VocabularyGenerationSource,
} from "../definitions/responses.js";
import { LlmProviderError, OpenAIVocabularyClient, type LlmVocabularyClient } from "./llm_vocabulary_client.js";
import { buildVocabularyPrompt } from "./vocabulary_prompt.js";
import { getModel } from "../shared_functions/certificate.js";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface VocabularyFromTextRequest {
  text: string;
  level: CefrLevel;
  count: number;
  includePhrases: boolean;
}

export function VocabularyFromText(text: string, level: CefrLevel, count: number) {
  return { text, level, count, includePhrases: true};
}

type ValidationResult =
  | { ok: true; request: VocabularyFromTextRequest }
  | { ok: false; error: ApiError };

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

const supportedLevels = new Set<string>(["A1", "A2", "B1", "B2", "C1", "C2"]);
const supportedSourceTypes = new Set<string>(["scan", "pdf"]);

export const vocabularyGenerationConfig = {
  model: getModel(),
  maxInputCharacters: Number.parseInt(process.env.MAX_VOCABULARY_INPUT_CHARACTERS ?? "12000", 10),
  timeoutMs: Number.parseInt(process.env.VOCABULARY_LLM_TIMEOUT_MS ?? "30000", 10),
};

export function parseVocabularyFromTextRequest(body: unknown): ValidationResult {
  if (body == null || typeof body !== "object") {
    return { ok: false, error: errors.invalidInputData };
  }

  const input = body as Record<string, unknown>;
  const text = input.text;
  const level = input.level ?? "B1";
  const count = input.count ?? 20;
  const includePhrases = input.includePhrases ?? true;
  const sourceType = input.sourceType ?? "scan";

  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, error: errors.invalidInputData };
  }
  if (typeof level !== "string" || !supportedLevels.has(level)) {
    return { ok: false, error: errors.invalidInputData };
  }
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > 50) {
    return { ok: false, error: errors.invalidInputData };
  }
  if (typeof includePhrases !== "boolean") {
    return { ok: false, error: errors.invalidInputData };
  }
  if (typeof sourceType !== "string" || !supportedSourceTypes.has(sourceType)) {
    return { ok: false, error: errors.invalidInputData };
  }

  return {
    ok: true,
    request: {
      text: text.trim(),
      level: level as CefrLevel,
      count,
      includePhrases
    },
  };
}

export class VocabularyGenerationService {
  constructor(private readonly llmClient: LlmVocabularyClient = new OpenAIVocabularyClient()) {}

  async generateFromText(request: VocabularyFromTextRequest): Promise<ServiceResult<GeneratedVocabularyCardResponse[]>> {
    if (request.text.length > vocabularyGenerationConfig.maxInputCharacters) {
      return { ok: false, error: errors.vocabularyInputTooLarge };
    }

    const prompt = buildVocabularyPrompt(request);
    const start = Date.now();

    try {
      const raw = await this.generateWithRetry(prompt);
      const cards = postProcessVocabularyCards(raw, request.count);
      if (cards.length === 0) {
        return { ok: false, error: errors.vocabularyGenerationFailed };
      }

      safeGenerationLog(request, cards.length, Date.now() - start);
      return { ok: true, data: cards };
    } catch (error) {
      console.log(error)
      safeGenerationErrorLog(request, error);
      return { ok: false, error: mapGenerationError(error) };
    }
  }

  private async generateWithRetry(prompt: string): Promise<unknown> {
    try {
      const raw = await this.llmClient.generateVocabulary(prompt, {
        model: vocabularyGenerationConfig.model,
        timeoutMs: vocabularyGenerationConfig.timeoutMs,
      });
      assertStructuredVocabularyResponse(raw);
      return raw;
    } catch (error) {
      if (!shouldRetry(error)) throw error;

      const retryRaw = await this.llmClient.generateVocabulary(prompt, {
        model: vocabularyGenerationConfig.model,
        timeoutMs: vocabularyGenerationConfig.timeoutMs,
      });
      assertStructuredVocabularyResponse(retryRaw);
      return retryRaw;
    }
  }
}

let defaultVocabularyGenerationService = new VocabularyGenerationService();

export function getVocabularyGenerationService(): VocabularyGenerationService {
  return defaultVocabularyGenerationService;
}

export function setVocabularyGenerationServiceForTest(service: VocabularyGenerationService): void {
  defaultVocabularyGenerationService = service;
}

export function resetVocabularyGenerationServiceForTest(): void {
  defaultVocabularyGenerationService = new VocabularyGenerationService();
}

export function postProcessVocabularyCards(raw: unknown, requestedCount: number): GeneratedVocabularyCardResponse[] {
  const rawCards = extractRawCards(raw);
  const seenTerms = new Set<string>();
  const cards: GeneratedVocabularyCardResponse[] = [];

  for (const rawCard of rawCards) {
    const card = parseGeneratedVocabularyCard(rawCard);
    if (card == null) continue;

    const key = normalizeTermKey(card.term);
    if (seenTerms.has(key)) continue;
    seenTerms.add(key);
    cards.push(card);

    if (cards.length >= requestedCount) break;
  }

  return cards;
}

function extractRawCards(raw: unknown): unknown[] {
  if (raw == null || typeof raw !== "object") return [];
  const cards = (raw as { cards?: unknown }).cards;
  return Array.isArray(cards) ? cards : [];
}

function parseGeneratedVocabularyCard(raw: unknown): GeneratedVocabularyCardResponse | null {
  if (raw == null || typeof raw !== "object") return null;

  const input = raw as Record<string, unknown>;
  const term = cleanTerm(input.term);
  const definition = cleanRequiredString(input.definition);
  const translation = cleanRequiredString(input.translation);

  if (term == null || definition == null || translation == null) return null;

  return GeneratedVocabularyCard(
    term,
    definition,
    translation,
    cleanOptionalString(input.partOfSpeech),
    cleanOptionalString(input.example),
    cleanOptionalString(input.sourceSentence),
    cleanOptionalString(input.difficulty)
  );
}

function assertStructuredVocabularyResponse(raw: unknown): void {
  if (extractRawCards(raw).length === 0) {
    throw new LlmProviderError("malformed-response", "Provider returned no cards array");
  }
}

function cleanRequiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = normalizeWhitespace(value);
  return cleaned.length > 0 ? cleaned : null;
}

function cleanOptionalString(value: unknown): string | null {
  if (value == null) return null;
  return cleanRequiredString(value);
}

function cleanTerm(value: unknown): string | null {
  const cleaned = cleanRequiredString(value)?.replace(/^[\s"'.,;:!?()[\]{}]+|[\s"'.,;:!?()[\]{}]+$/g, "");
  return cleaned != null && cleaned.length > 0 ? cleaned : null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeTermKey(term: string): string {
  return normalizeWhitespace(term).toLocaleLowerCase("en-US");
}

function shouldRetry(error: unknown): boolean {
  if (!(error instanceof LlmProviderError)) return false;
  return error.category === "timeout"
    || error.category === "rate-limit"
    || error.category === "provider-unavailable"
    || error.category === "malformed-response";
}

function mapGenerationError(error: unknown): ApiError {
  if (!(error instanceof LlmProviderError)) return errors.vocabularyGenerationFailed;
  if (error.category === "missing-api-key" || error.category === "unauthorized") {
    return errors.vocabularyGenerationUnavailable;
  }
  if (error.category === "timeout" || error.category === "rate-limit" || error.category === "provider-unavailable") {
    return errors.vocabularyGenerationUnavailable;
  }
  return errors.vocabularyGenerationFailed;
}

function safeGenerationLog(request: VocabularyFromTextRequest, outputCount: number, latencyMs: number): void {
  console.log(
    "Vocabulary generation complete",
    JSON.stringify({ inputCharacters: request.text.length, requestedCount: request.count, outputCount, latencyMs })
  );
}

function safeGenerationErrorLog(request: VocabularyFromTextRequest, error: unknown): void {
  const category = error instanceof LlmProviderError ? error.category : "unknown";
  console.log(
    "Vocabulary generation failed",
    JSON.stringify({ inputCharacters: request.text.length, requestedCount: request.count, category })
  );
}

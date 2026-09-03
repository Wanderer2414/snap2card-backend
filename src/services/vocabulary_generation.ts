import type { ApiError } from "../configs/errors.js";
import { errors } from "../configs/errors.js";
import {
  GeneratedVocabularyCard,
  type GeneratedVocabularyCard as GeneratedVocabularyCardResponse,
  type VocabularyGenerationSource,
} from "../definitions/responses.js";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface VocabularyFromTextRequest {
  text: string;
  level: CefrLevel;
  count: number;
  includePhrases: boolean;
  sourceType: VocabularyGenerationSource["type"];
}

type ValidationResult =
  | { ok: true; request: VocabularyFromTextRequest }
  | { ok: false; error: ApiError };

const supportedLevels = new Set<string>(["A1", "A2", "B1", "B2", "C1", "C2"]);
const supportedSourceTypes = new Set<string>(["scan", "pdf"]);

const mockCards: GeneratedVocabularyCardResponse[] = [
  GeneratedVocabularyCard(
    "exacerbate",
    "To make a problem or bad situation worse.",
    "làm trầm trọng thêm",
    "verb",
    "Pollution can exacerbate health problems.",
    "Climate change can exacerbate existing inequalities.",
    "B1"
  ),
  GeneratedVocabularyCard(
    "inequality",
    "An unfair difference between groups of people.",
    "sự bất bình đẳng",
    "noun",
    "Education can reduce inequality.",
    "Climate change can exacerbate existing inequalities.",
    "B1"
  ),
  GeneratedVocabularyCard(
    "vulnerable",
    "Easily hurt, affected, or harmed.",
    "dễ bị tổn thương",
    "adjective",
    "Older adults can be vulnerable during extreme heat.",
    "Vulnerable communities often face higher climate risks.",
    "B1"
  ),
];

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
      includePhrases,
      sourceType: sourceType as VocabularyGenerationSource["type"],
    },
  };
}

export class VocabularyGenerationService {
  generateFromText(request: VocabularyFromTextRequest): GeneratedVocabularyCardResponse[] {
    void request.text;
    void request.level;
    void request.includePhrases;
    return mockCards.slice(0, Math.min(request.count, mockCards.length));
  }
}

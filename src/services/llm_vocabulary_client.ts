export type LlmProviderErrorCategory =
  | "missing-api-key"
  | "unauthorized"
  | "timeout"
  | "rate-limit"
  | "provider-unavailable"
  | "malformed-response";

import { getOpenAIKey } from "../shared_functions/certificate.js";

export class LlmProviderError extends Error {
  constructor(
    readonly category: LlmProviderErrorCategory,
    message: string = category,
  ) {
    super(message);
    this.name = "LlmProviderError";
  }
}

export interface LlmVocabularyClientOptions {
  model: string;
  timeoutMs: number;
}

export interface LlmVocabularyClient {
  generateVocabulary(prompt: string, options: LlmVocabularyClientOptions): Promise<unknown>;
}

interface OpenAIChatCompletionsResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export class OpenAIVocabularyClient implements LlmVocabularyClient {
  async generateVocabulary(prompt: string, options: LlmVocabularyClientOptions): Promise<unknown> {
    const apiKey = getOpenAIKey();
    if (apiKey == null || apiKey.trim().length === 0) {
      throw new LlmProviderError("missing-api-key", "Missing OpenAI API key");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: "system",
              content: "Return only valid JSON matching this shape: {\"cards\":[{\"term\":string,\"definition\":string,\"translation\":string,\"partOfSpeech\":string|null,\"example\":string|null,\"sourceSentence\":string|null,\"difficulty\":string|null}]}",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw mapOpenAIHttpError(response.status);
      }

      const data = await response.json() as OpenAIChatCompletionsResponse;
      const text = data.choices?.[0]?.message?.content;
      if (text == null || text.trim().length === 0) {
        throw new LlmProviderError("malformed-response", "OpenAI returned no structured text");
      }

      try {
        return JSON.parse(text) as unknown;
      } catch (_error) {
        throw new LlmProviderError("malformed-response", "OpenAI returned malformed structured data");
      }
    } catch (error) {
      if (isAbortError(error)) {
        throw new LlmProviderError("timeout", "OpenAI request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

const vocabularyResponseSchema = {
  type: "OBJECT",
  properties: {
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          term: { type: "STRING" },
          definition: { type: "STRING" },
          translation: { type: "STRING" },
          partOfSpeech: { type: "STRING", nullable: true },
          example: { type: "STRING", nullable: true },
          sourceSentence: { type: "STRING", nullable: true },
          difficulty: { type: "STRING", nullable: true },
        },
        required: ["term", "definition", "translation"],
      },
    },
  },
  required: ["cards"],
} as const;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export class GeminiVocabularyClient implements LlmVocabularyClient {
  async generateVocabulary(prompt: string, options: LlmVocabularyClientOptions): Promise<unknown> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey == null || apiKey.trim().length === 0) {
      throw new LlmProviderError("missing-api-key", "Missing Gemini API key");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
              responseSchema: vocabularyResponseSchema,
            },
          }),
        }
      );

      if (!response.ok) {
        throw mapGeminiHttpError(response.status);
      }

      const data = await response.json() as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
      if (text == null || text.trim().length === 0) {
        throw new LlmProviderError("malformed-response", "Gemini returned no structured text");
      }

      try {
        return JSON.parse(text) as unknown;
      } catch (_error) {
        throw new LlmProviderError("malformed-response", "Gemini returned malformed structured data");
      }
    } catch (error) {
      if (isAbortError(error)) {
        throw new LlmProviderError("timeout", "Gemini request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function mapGeminiHttpError(status: number): LlmProviderError {
  if (status === 401 || status === 403) return new LlmProviderError("unauthorized", "Gemini rejected the API key");
  if (status === 429) return new LlmProviderError("rate-limit", "Gemini rate limit exceeded");
  if (status >= 500) return new LlmProviderError("provider-unavailable", "Gemini service unavailable");
  return new LlmProviderError("malformed-response", "Gemini request failed");
}

function mapOpenAIHttpError(status: number): LlmProviderError {
  if (status === 401 || status === 403) return new LlmProviderError("unauthorized", "OpenAI rejected the API key");
  if (status === 429) return new LlmProviderError("rate-limit", "OpenAI rate limit exceeded");
  if (status >= 500) return new LlmProviderError("provider-unavailable", "OpenAI service unavailable");
  return new LlmProviderError("malformed-response", "OpenAI request failed");
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

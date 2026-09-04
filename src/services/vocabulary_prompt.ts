import type { VocabularyFromTextRequest } from "./vocabulary_generation.js";

export function buildVocabularyPrompt(request: VocabularyFromTextRequest): string {
  return [
    "You are a vocabulary extraction system for English learners.",
    "Select the most useful vocabulary items from the supplied English text.",
    "",
    `Learner level: ${request.level}`,
    `Requested card count: ${request.count}`,
    `Include phrases: ${request.includePhrases}`,
    "",
    "Rules:",
    "- prioritize vocabulary slightly above the learner's current level",
    "- avoid extremely common/basic words",
    "- avoid names, URLs, numbers, and formatting artifacts",
    "- include collocations/phrasal verbs only when useful and includePhrases=true",
    "- do not return duplicates",
    "- infer definitions according to the document context",
    "- keep definitions short and learner-friendly",
    "- Vietnamese translation should be concise and context-appropriate",
    "- examples should be natural and easy to understand",
    "- only use vocabulary supported by the source text",
    "- return no more than the requested card count",
    "",
    "Return structured data that matches the configured response schema.",
    "",
    "Source text:",
    request.text,
  ].join("\n");
}

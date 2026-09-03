import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import { getBody } from "../shared_functions/request.js";
import { errors } from "../configs/errors.js";
import { VocabularyGeneration } from "../definitions/responses.js";
import {
  parseVocabularyFromTextRequest,
  VocabularyGenerationService,
} from "../services/vocabulary_generation.js";

const vocabularyGenerationService = new VocabularyGenerationService();

export const vocabulary_from_text_handler: Handler = async (req: IncomingMessage, res: ServerResponse) => {
  let body: unknown;
  try {
    body = JSON.parse(await getBody(req));
  } catch (_error) {
    sendError(req, res, errors.invalidInputData);
    return;
  }

  const validation = parseVocabularyFromTextRequest(body);
  if (!validation.ok) {
    sendError(req, res, validation.error);
    return;
  }

  const cards = vocabularyGenerationService.generateFromText(validation.request);
  sendResponse(
    req,
    res,
    200,
    VocabularyGeneration({ type: validation.request.sourceType }, cards)
  );
};

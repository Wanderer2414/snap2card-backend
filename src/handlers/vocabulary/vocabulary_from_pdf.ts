import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { parseMultipartFormData } from "../../shared_functions/request.js";
import { errors } from "../../configs/errors.js";
import { VocabularyGeneration } from "../../definitions/responses.js";
import { PdfTextExtractionService } from "../../services/pdf_text_extraction.js";
import {
  parseVocabularyFromTextRequest,
  VocabularyGenerationService,
} from "../../services/vocabulary_generation.js";

const pdfTextExtractionService = new PdfTextExtractionService();
const vocabularyGenerationService = new VocabularyGenerationService();

export const vocabulary_from_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const multipart = await parseMultipartFormData(req);
    const file = multipart?.files.find((item) => item.fieldName === "file");
    if (multipart == null || file == null) {
      sendError(req, res, errors.invalidPdf);
      return;
    }

    const includePhrases = parseOptionalBoolean(multipart.fields.includePhrases);
    if (includePhrases === null) {
      sendError(req, res, errors.invalidInputData);
      return;
    }

    const requestOptions = parseVocabularyFromTextRequest({
      text: "PDF extraction pending",
      level: multipart.fields.level,
      count: multipart.fields.count == null ? undefined : Number(multipart.fields.count),
      includePhrases,
      sourceType: "pdf",
    });

    if (!requestOptions.ok) {
      sendError(req, res, requestOptions.error);
      return;
    }

    const extraction = await pdfTextExtractionService.extractText(file);
    if (!extraction.ok) {
      sendError(req, res, extraction.error);
      return;
    }

    const cards = vocabularyGenerationService.generateFromText({
      ...requestOptions.request,
      text: extraction.data.text,
    });
    sendResponse(req, res, 200, VocabularyGeneration({ type: "pdf" }, cards));
  } catch (_error) {
    sendError(req, res, errors.invalidPdf);
  }
};

function parseOptionalBoolean(value: string | undefined): boolean | undefined | null {
  if (value == null) return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return null;
}

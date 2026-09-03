import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { parseMultipartFormData } from "../../shared_functions/request.js";
import { errors, type ApiError } from "../../configs/errors.js";
import { VocabularyGeneration } from "../../definitions/responses.js";
import { extractPdfText, type PdfExtractArgs } from "../../services/pdf_text_extraction.js";
import {
  parseVocabularyFromTextRequest,
  VocabularyGenerationService,
} from "../../services/vocabulary_generation.js";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

const vocabularyGenerationService = new VocabularyGenerationService();
const maxPdfPages = 10;
const minReadableCharacters = 80;

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

    const pdfPath = path.join(process.cwd(), `upload_${Date.now()}.pdf`);
    await writeFile(pdfPath, file.data);

    const result = await extractPdfText({
        pdfPath,
        maxPages: maxPdfPages,
        minReadableCharacters: minReadableCharacters,
    });
    await rm(pdfPath, { force: true });

    if (!result.ok) {
      sendError(req, res, mapPdfError(result.code ?? ""));
      return;
    }

    const text = (result.text ?? "").trim();
    if (text.length < minReadableCharacters) {
      sendError(req, res, errors.noReadableText);
      return;
    }

    const cards = vocabularyGenerationService.generateFromText({
      ...requestOptions.request,
      text,
    });
    sendResponse(req, res, 200, VocabularyGeneration({ type: "pdf" }, cards));
  } catch (_error) {
    sendError(req, res, errors.invalidPdf);
  }
};

function mapPdfError(code: string): ApiError {
  switch (code) {
    case "EMPTY_PDF": return errors.emptyPdf;
    case "PDF_TOO_LARGE": return errors.pdfTooLarge;
    case "PDF_PASSWORD_PROTECTED": return errors.pdfPasswordProtected;
    case "NO_READABLE_TEXT": return errors.noReadableText;
    default: return errors.invalidPdf;
  }
}

function parseOptionalBoolean(value: string | undefined): boolean | undefined | null {
  if (value == null) return undefined;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return null;
}
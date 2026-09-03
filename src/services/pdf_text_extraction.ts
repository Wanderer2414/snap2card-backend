import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ApiError } from "../configs/errors.js";
import { errors } from "../configs/errors.js";

export const pdfExtractionConfig = {
  // MVP guardrails: do not silently process huge PDFs, and require useful text for Phase 3.
  maxPdfPages: Number.parseInt(process.env.MAX_PDF_PAGES ?? "10", 10),
  minReadableCharacters: Number.parseInt(process.env.MIN_READABLE_CHARACTERS ?? "80", 10),
  maxPdfBytes: Number.parseInt(process.env.MAX_PDF_BYTES ?? `${10 * 1024 * 1024}`, 10),
};

export interface UploadedFile {
  filename: string;
  contentType: string;
  data: Buffer;
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  processedPageCount: number;
  characterCount: number;
  warnings: string[];
}

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

interface PythonPdfExtractionSuccess extends PdfExtractionResult {
  ok: true;
}

interface PythonPdfExtractionFailure {
  ok: false;
  code: string;
  message: string;
}

type PythonPdfExtractionResponse = PythonPdfExtractionSuccess | PythonPdfExtractionFailure;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extractionScriptPath = path.resolve(__dirname, "../../scripts/pdf_text_extract.py");
const localPythonPath = path.resolve(__dirname, "../../.venv/bin/python");

export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export class PdfTextExtractionService {
  async extractText(file: UploadedFile): Promise<ServiceResult<PdfExtractionResult>> {
    const validation = this.validateFile(file);
    if (!validation.ok) return validation;

    const tempDir = await mkdtemp(path.join(tmpdir(), "snap2card-pdf-"));
    const pdfPath = path.join(tempDir, "upload.pdf");

    try {
      await writeFile(pdfPath, file.data);
      const result = await runPyMuPdfExtraction(pdfPath);
      if (!result.ok) return { ok: false, error: mapPdfError(result.code) };

      const text = cleanExtractedText(result.text);
      if (text.length < pdfExtractionConfig.minReadableCharacters) {
        return { ok: false, error: errors.noReadableText };
      }

      return {
        ok: true,
        data: {
          text,
          pageCount: result.pageCount,
          processedPageCount: result.processedPageCount,
          characterCount: text.length,
          warnings: result.warnings ?? [],
        },
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private validateFile(file: UploadedFile): ServiceResult<null> {
    if (file.data.length === 0) {
      return { ok: false, error: errors.emptyPdf };
    }
    if (file.data.length > pdfExtractionConfig.maxPdfBytes) {
      return { ok: false, error: errors.pdfTooLarge };
    }
    if (!file.filename.toLowerCase().endsWith(".pdf")) {
      return { ok: false, error: errors.invalidPdf };
    }
    if (file.contentType !== "application/pdf" && file.contentType !== "application/octet-stream") {
      return { ok: false, error: errors.invalidPdf };
    }
    if (!file.data.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      return { ok: false, error: errors.invalidPdf };
    }
    return { ok: true, data: null };
  }
}

function runPyMuPdfExtraction(pdfPath: string): Promise<PythonPdfExtractionResponse> {
  return new Promise((resolve) => {
    const child = spawn(resolvePythonBinary(), [
      extractionScriptPath,
      pdfPath,
      "--max-pages",
      pdfExtractionConfig.maxPdfPages.toString(),
      "--min-readable-characters",
      pdfExtractionConfig.minReadableCharacters.toString(),
    ]);

    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });

    child.on("error", () => {
      resolve({ ok: false, code: "PYMUPDF_NOT_INSTALLED", message: "PyMuPDF is not available" });
    });
    child.on("close", () => {
      try {
        resolve(JSON.parse(stdout) as PythonPdfExtractionResponse);
      } catch (_error) {
        resolve({ ok: false, code: "INVALID_PDF", message: "Could not extract PDF text" });
      }
    });
  });
}

function resolvePythonBinary(): string {
  if (process.env.PYTHON_BIN != null && process.env.PYTHON_BIN.length > 0) return process.env.PYTHON_BIN;
  if (existsSync(localPythonPath)) return localPythonPath;
  return "python3";
}

function mapPdfError(code: string): ApiError {
  switch (code) {
    case "EMPTY_PDF":
      return errors.emptyPdf;
    case "PDF_TOO_LARGE":
      return errors.pdfTooLarge;
    case "PDF_PASSWORD_PROTECTED":
      return errors.pdfPasswordProtected;
    case "NO_READABLE_TEXT":
      return errors.noReadableText;
    default:
      return errors.invalidPdf;
  }
}

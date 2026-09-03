import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cleanExtractedText, PdfTextExtractionService } from "../src/services/pdf_text_extraction.js";

const python = process.env.PYTHON_BIN ?? (existsSync(".venv/bin/python") ? ".venv/bin/python" : "python3");

test("normal text PDF extracts readable text", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "normal.pdf");
    createTextPdf(pdfPath, ["Introduction to Climate Change\nClimate change refers to long-term shifts in temperatures."]);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.pageCount, 1);
    assert.equal(result.data.processedPageCount, 1);
    assert.match(result.data.text, /Climate Change/);
    assert.ok(result.data.characterCount > 80);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("multi-page PDF extracts content from multiple pages", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "multi.pdf");
    createTextPdf(pdfPath, [
      "Page one discusses mitigation strategies and climate adaptation in cities.",
      "Page two explains vulnerable communities and long-term inequality risks.",
    ]);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.pageCount, 2);
    assert.match(result.data.text, /mitigation strategies/);
    assert.match(result.data.text, /vulnerable communities/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("headings and paragraphs keep readable structure", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "structured.pdf");
    createTextPdf(pdfPath, [
      "Introduction to Climate Change\n\nClimate change refers to long-term shifts in temperatures.\n\nMitigation strategies include renewable energy and conservation.",
    ]);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.data.text, /Introduction to Climate Change/);
    assert.match(result.data.text, /Climate change refers/);
    assert.match(result.data.text, /Mitigation strategies/);
    assert.doesNotMatch(result.data.text, /%PDF-/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("empty or near-empty PDF reports no readable text", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "empty.pdf");
    createBlankPdf(pdfPath, 1);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.message, "PDF does not contain enough readable text");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("scanned image-only PDF reports no readable text", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "scanned.pdf");
    createImageOnlyPdf(pdfPath);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.message, "PDF does not contain enough readable text");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("corrupted PDF is rejected without crashing", async () => {
  const result = await new PdfTextExtractionService().extractText({
    filename: "broken.pdf",
    contentType: "application/pdf",
    data: Buffer.from("%PDF-this is not a real pdf"),
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.message, "Invalid PDF");
});

test("empty file is rejected", async () => {
  const result = await new PdfTextExtractionService().extractText({
    filename: "empty.pdf",
    contentType: "application/pdf",
    data: Buffer.alloc(0),
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.message, "Empty PDF");
});

test("non-PDF file is rejected", async () => {
  const result = await new PdfTextExtractionService().extractText({
    filename: "notes.txt",
    contentType: "text/plain",
    data: Buffer.from("not a pdf"),
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.message, "Invalid PDF");
});

test("non-PDF renamed with pdf extension is rejected", async () => {
  const result = await new PdfTextExtractionService().extractText({
    filename: "renamed.pdf",
    contentType: "application/pdf",
    data: Buffer.from("this is plain text renamed as a pdf"),
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.message, "Invalid PDF");
});

test("temporary extraction directories are removed", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "cleanup.pdf");
    createTextPdf(pdfPath, ["Cleanup verification for climate text extraction with enough readable characters."]);
    const before = countServiceTempDirs();

    await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.ok(countServiceTempDirs() <= before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("PDF exceeding page limit is rejected", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "too-many-pages.pdf");
    createTextPdf(pdfPath, Array.from({ length: 11 }, (_, index) => `Page ${index + 1} has readable climate vocabulary content.`));

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.message, "PDF exceeds the page or file size limit");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("password-protected PDF is rejected", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "snap2card-pdf-test-"));
  try {
    const pdfPath = path.join(dir, "protected.pdf");
    createPasswordProtectedPdf(pdfPath);

    const result = await new PdfTextExtractionService().extractText(fileFromPath(pdfPath));

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.message, "Password-protected PDFs are not supported");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("text cleanup is deterministic and preserves paragraph boundaries", () => {
  const cleaned = cleanExtractedText(" Title\r\n\r\n\r\nClimate\u0000  change\t\tmatters.\n\n\nSecond   paragraph. ");

  assert.equal(cleaned, "Title\n\nClimate change matters.\n\nSecond paragraph.");
});

function fileFromPath(pdfPath: string) {
  return {
    filename: path.basename(pdfPath),
    contentType: "application/pdf",
    data: readFileSync(pdfPath),
  };
}

function createTextPdf(pdfPath: string, pages: string[]): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
for text in sys.argv[2:]:
    page = doc.new_page()
    page.insert_textbox(fitz.Rect(72, 72, 520, 760), text, fontsize=12)
doc.save(sys.argv[1])`,
    pdfPath,
    ...pages,
  ]);
}

function createBlankPdf(pdfPath: string, pageCount: number): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
for _ in range(int(sys.argv[2])):
    doc.new_page()
doc.save(sys.argv[1])`,
    pdfPath,
    pageCount.toString(),
  ]);
}

function createImageOnlyPdf(pdfPath: string): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
page = doc.new_page()
page.draw_rect(fitz.Rect(72, 72, 400, 300), color=(0, 0, 0), fill=(0.9, 0.9, 0.9))
doc.save(sys.argv[1])`,
    pdfPath,
  ]);
}

function createPasswordProtectedPdf(pdfPath: string): void {
  execFileSync(python, [
    "-c",
    `import fitz, sys
doc = fitz.open()
page = doc.new_page()
page.insert_textbox(fitz.Rect(72, 72, 520, 760), 'Protected climate document with readable text before encryption.', fontsize=12)
doc.save(sys.argv[1], encryption=fitz.PDF_ENCRYPT_AES_256, owner_pw='owner', user_pw='user')`,
    pdfPath,
  ]);
}

function countServiceTempDirs(): number {
  return readdirSync(tmpdir()).filter((name) => name.startsWith("snap2card-pdf-")).length;
}

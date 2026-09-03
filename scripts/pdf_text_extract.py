#!/usr/bin/env python3
import argparse
import json
import re
import string
import sys

try:
    import pymupdf;
except ImportError:
    print(json.dumps({"ok": False, "code": "PYMUPDF_NOT_INSTALLED", "message": "PyMuPDF is not installed"}))
    sys.exit(0)


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\x00", "")
    text = "".join(ch if ch == "\n" or ch == "\t" or ch in string.printable or ord(ch) >= 0x80 else " " for ch in text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fail(code: str, message: str) -> None:
    print(json.dumps({"ok": False, "code": code, "message": message}))


def extract(path: str, max_pages: int, min_readable_characters: int) -> None:
    try:
        doc = pymupdf.open(path)
    except Exception:
        fail("INVALID_PDF", "Invalid or corrupted PDF")
        return

    try:
        if doc.needs_pass:
            fail("PDF_PASSWORD_PROTECTED", "Password-protected PDFs are not supported")
            return

        page_count = doc.page_count
        if page_count == 0:
            fail("EMPTY_PDF", "PDF has no pages")
            return
        if page_count > max_pages:
            fail("PDF_TOO_LARGE", f"PDF exceeds the {max_pages} page limit")
            return

        pages: list[str] = []
        for page_index in range(page_count):
            page = doc.load_page(page_index)
            pages.append(page.get_text("text", sort=True))

        text = clean_text("\n\n".join(pages))
        character_count = len(text)
        if character_count < min_readable_characters:
            fail("NO_READABLE_TEXT", "PDF does not contain enough readable text")
            return

        print(json.dumps({
            "ok": True,
            "text": text,
            "pageCount": page_count,
            "processedPageCount": page_count,
            "characterCount": character_count,
            "warnings": [],
        }, ensure_ascii=False))
    finally:
        doc.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract readable text from a PDF using PyMuPDF")
    parser.add_argument("path")
    parser.add_argument("--max-pages", type=int, required=True)
    parser.add_argument("--min-readable-characters", type=int, required=True)
    args = parser.parse_args()
    extract(args.path, args.max_pages, args.min_readable_characters)


if __name__ == "__main__":
    main()

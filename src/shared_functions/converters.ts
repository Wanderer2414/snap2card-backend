export interface Pdf {
  data: Buffer;
  fileName: string;
}

export interface Image {
  data: Buffer;
  fileName: string;
  mimeType: string;
  extension: string;
}

const PDF_SIGNATURE = Buffer.from("%PDF-");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const WEBP_SIGNATURE = Buffer.from("WEBP");
const BMP_SIGNATURE = Buffer.from("BM");
const ICO_SIGNATURE = Buffer.from([0x00, 0x00, 0x01, 0x00]);

function startsWith(data: Buffer, signature: Buffer, offset: number = 0): boolean {
  return data.length >= offset + signature.length && data.subarray(offset, offset + signature.length).equals(signature);
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  bmp: "image/bmp",
  ico: "image/x-icon",
  webp: "image/webp",
  pdf: "application/pdf",
};

export function mimeTypeForExtension(extension: string): string {
  return MIME_BY_EXTENSION[extension.toLowerCase()] ?? "application/octet-stream";
}

export const converters = {
  toPdf(data: Buffer, fileName: string = "document.pdf"): Pdf | null {
    if (!startsWith(data, PDF_SIGNATURE)) return null;
    return { data, fileName };
  },

  toImage(data: Buffer, fileName: string = "image"): Image | null {
    if (startsWith(data, PNG_SIGNATURE)) {
      return { data, fileName: `${fileName}.png`, mimeType: "image/png", extension: "png" };
    }
    if (startsWith(data, JPEG_SIGNATURE)) {
      return { data, fileName: `${fileName}.jpg`, mimeType: "image/jpeg", extension: "jpg" };
    }
    if (startsWith(data, BMP_SIGNATURE)) {
      return { data, fileName: `${fileName}.bmp`, mimeType: "image/bmp", extension: "bmp" };
    }
    if (startsWith(data, ICO_SIGNATURE)) {
      return { data, fileName: `${fileName}.ico`, mimeType: "image/x-icon", extension: "ico" };
    }
    if (startsWith(data, WEBP_SIGNATURE, 8) && startsWith(data, Buffer.from("RIFF"))) {
      return { data, fileName: `${fileName}.webp`, mimeType: "image/webp", extension: "webp" };
    }
    return null;
  },
} as const;

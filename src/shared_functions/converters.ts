export interface Pdf {
  data: Buffer;
  fileName: string;
}

export interface Png {
  data: Buffer;
  fileName: string;
}

const PDF_SIGNATURE = Buffer.from("%PDF-");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const converters = {
  toPdf(data: Buffer, fileName: string = "document.pdf"): Pdf | null {
    if (!data.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE)) return null;
    return { data, fileName };
  },

  toPng(data: Buffer, fileName: string = "avatar.png"): Png | null {
    if (!data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) return null;
    return { data, fileName };
  },
} as const;

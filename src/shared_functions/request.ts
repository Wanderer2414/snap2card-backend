import { IncomingMessage } from "http";

export function getHeader(req: IncomingMessage): string {
    return JSON.stringify(
    Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : value ?? "",
      ])
    )
  );
}

export async function getBody(req: IncomingMessage): Promise<string> {
  return (await getRawBody(req)).toString("utf8");
}

export async function getRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export interface MultipartFile {
  fieldName: string;
  filename: string;
  contentType: string;
  data: Buffer;
}

export interface MultipartFormData {
  fields: Record<string, string>;
  files: MultipartFile[];
}

export async function parseMultipartFormData(req: IncomingMessage): Promise<MultipartFormData | null> {
  const contentType = req.headers["content-type"];
  const match = typeof contentType === "string" ? contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i) : null;
  const boundary = match?.[1] ?? match?.[2];
  if (boundary == null || boundary.length === 0) return null;

  const body = await getRawBody(req);
  const parts = splitBuffer(body, Buffer.from(`--${boundary}`));
  const fields: Record<string, string> = {};
  const files: MultipartFile[] = [];

  for (const rawPart of parts) {
    let part = trimLeadingPart(rawPart);
    if (part.length === 0 || part.equals(Buffer.from("--"))) continue;
    if (part.subarray(part.length - 2).equals(Buffer.from("--"))) part = part.subarray(0, part.length - 2);

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd < 0) continue;

    const headerText = part.subarray(0, headerEnd).toString("utf8");
    let data = part.subarray(headerEnd + 4);
    if (data.subarray(data.length - 2).equals(Buffer.from("\r\n"))) data = data.subarray(0, data.length - 2);

    const disposition = headerText.match(/content-disposition:\s*form-data;\s*([^\r\n]+)/i)?.[1];
    const name = disposition?.match(/name="([^"]+)"/)?.[1];
    if (name == null) continue;

    const filename = disposition?.match(/filename="([^"]*)"/)?.[1];
    const partContentType = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "application/octet-stream";

    if (filename != null && filename.length > 0) {
      files.push({ fieldName: name, filename, contentType: partContentType, data });
    } else {
      fields[name] = data.toString("utf8").trim();
    }
  }

  return { fields, files };
}

function splitBuffer(buffer: Buffer, separator: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index !== -1) {
    parts.push(buffer.subarray(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }
  parts.push(buffer.subarray(start));
  return parts;
}

function trimLeadingPart(buffer: Buffer): Buffer {
  let start = 0;
  while (start < buffer.length && (buffer[start] === 13 || buffer[start] === 10)) start++;
  return buffer.subarray(start);
}

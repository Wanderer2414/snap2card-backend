import { IncomingMessage, OutgoingMessage } from "http";

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
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

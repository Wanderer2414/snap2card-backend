import type { IncomingMessage, ServerResponse } from "node:http";
import type { ApiError } from "../configs/errors.js";
import type { ApiResponse } from "../definitions/responses.js";
import { getTime } from "./get_time.js";

const MAX_LOGGED_BODY_LENGTH = 100 * 1024;

function truncateLoggedBody(body: string): string {
  if (Buffer.byteLength(body, "utf8") <= MAX_LOGGED_BODY_LENGTH) return body;
  return Buffer.from(body, "utf8").subarray(0, MAX_LOGGED_BODY_LENGTH).toString("utf8");
}

// FN_REQUEST_LOG_INSERT(
//     p_endpoint       VARCHAR(60),
//     p_header         TEXT,
//     p_body           TEXT,
//     p_reponse_header TEXT,
//     p_reponse_body   TEXT
// ) RETURNS INT

export function sendJson(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
  headerBody: string = "[body not captured]"
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));

  if (process.env.SNAP2CARD_SKIP_REQUEST_LOG === "1") return;
  
  void import("../controllers/db_router.js")
    .then(async ({ default: database_pool }) => {
      const requestBody = shouldOmitRequestBody(req) ? "[request body omitted]" : truncateLoggedBody(headerBody);
      const responseBody = shouldOmitLoggedResponseBody(req) ? "[response body omitted]" : JSON.stringify(body);
      return database_pool.query("SELECT FN_REQUEST_LOG_INSERT($1, $2, $3, $4, $5)", [req.url!, getLoggedHeaders(req), requestBody, status.toString(), responseBody]);
    })
    .catch((e) => {
      console.log("DB Error: ", e);
    });
  console.log(getTime(), ": New request comming, logged into database: ", req.url);
}

function isMultipart(req: IncomingMessage): boolean {
  const contentType = req.headers["content-type"];
  return typeof contentType === "string" && contentType.toLowerCase().startsWith("multipart/form-data");
}

function shouldOmitRequestBody(req: IncomingMessage): boolean {
  const url = req.url ?? "";
  return isMultipart(req) || url.includes("/vocabulary/") || url.includes("/account/login");
}

function shouldOmitLoggedResponseBody(req: IncomingMessage): boolean {
  const url = req.url ?? "";
  return url.includes("/vocabulary/") || url.includes("/account/login");
}

function getLoggedHeaders(req: IncomingMessage): string {
  const redactedHeaders = Object.fromEntries(
    Object.entries(req.headers).map(([key, value]) => [
      key,
      isSensitiveHeader(key) ? "[redacted]" : Array.isArray(value) ? value.join(", ") : value ?? "",
    ])
  );
  return JSON.stringify(redactedHeaders);
}

function isSensitiveHeader(key: string): boolean {
  return ["authorization", "cookie", "set-cookie"].includes(key.toLowerCase());
}

export function sendError(req:IncomingMessage, res: ServerResponse, error: ApiError, rawbody: string = "[body not captured]"): void {
  sendJson(req, res, error.code, { status: "error", message: error.message }, rawbody);
}

export function sendResponse(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  body: ApiResponse,
  headerBody: string = "[body not captured]"
): void {
  sendJson(req, res, status, body as unknown as Record<string, unknown>, headerBody);
}

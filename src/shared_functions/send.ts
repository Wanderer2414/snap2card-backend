import type { IncomingMessage, ServerResponse } from "node:http";
import type { ApiError } from "../configs/errors.js";
import type { ApiResponse } from "../definitions/responses.js";
import { getHeader } from "./request.js";
import { getTime } from "./get_time.js";

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
      return database_pool.query("SELECT FN_REQUEST_LOG_INSERT($1, $2, $3, $4, $5)", [req.url!, getHeader(req), headerBody, status.toString(), JSON.stringify(body)]);
    })
    .catch((e) => {
      console.log("DB Error: ", e);
    });
  console.log(getTime(), ": New request comming, logged into database: ", req.url);
}

export function sendError(
  req: IncomingMessage,
  res: ServerResponse,
  error: ApiError,
  headerBody: string = "[body not captured]"
): void {
  sendJson(req, res, error.code, { status: "error", message: error.message }, headerBody);
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

import type { IncomingMessage, ServerResponse } from "node:http";
import type { ApiError } from "../configs/errors.js";
import "../controllers/db_router.js"
import database_pool from "../controllers/db_router.js";
import { getBody, getHeader } from "./request.js";

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
  body: Record<string, unknown>
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
  
  database_pool.query("SELECT FN_REQUEST_LOG_INSERT($1, $2, $3, $4, $5)", [req.url!, getHeader(req), getBody(req), status.toString(), JSON.stringify(body)])
  console.log("New request comming, logged into database: ", req.url)
}

export function sendError(req:IncomingMessage, res: ServerResponse, error: ApiError): void {
  sendJson(req, res, error.code, { status: "error", message: error.message });
}
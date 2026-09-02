import type { IncomingMessage, ServerResponse } from "node:http";
import { errors, type ApiError } from "../configs/errors.js";
import type { ApiResponse } from "../definitions/responses.js";
import "../controllers/db_router.js"
import database_pool from "../controllers/db_router.js";
import { getBody, getHeader } from "./request.js";
import { time } from "node:console";
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
  body: Record<string, unknown>
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
  
  try {
    database_pool.query("SELECT FN_REQUEST_LOG_INSERT($1, $2, $3, $4, $5)", [req.url!, getHeader(req), getBody(req), status.toString(), JSON.stringify(body)]).catch((e) => {
      console.log("DB Error: ", e)
      throw e
    })
  }
  catch (e) {
    console.log("Error: ", e)
    sendError(req, res, errors.invalidInputData)
  }
  console.log(getTime(), ": New request comming, logged into database: ", req.url)
}

export function sendError(req:IncomingMessage, res: ServerResponse, error: ApiError): void {
  sendJson(req, res, error.code, { status: "error", message: error.message });
}

export function sendResponse(
  req: IncomingMessage,
  res: ServerResponse,
  status: number,
  body: ApiResponse
): void {
  sendJson(req, res, status, body as unknown as Record<string, unknown>);
}
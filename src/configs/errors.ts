import type { ServerResponse } from "node:http";
import { sendJson } from "./config.js";

export interface ErrorBody {
  status: "error";
  message: string;
}

export interface ApiError {
  code: number;
  message: string;
}

export const errors = {
  invalidInputData: { code: 400, message: "Invalid input data" },
  missingRequiredField: (field: string): ApiError => ({
    code: 400,
    message: `Missing required field: ${field}`,
  }),
  invalidOrExpiredToken: { code: 401, message: "Invalid or expired token" },
  invalidEmailOrPassword: { code: 401, message: "Invalid email or password" },
  cardNotFound: { code: 404, message: "Card not found" },
  categoryNotFound: { code: 404, message: "Category not found" },
  notFound: { code: 404, message: "Not found" },
  internalServerError: { code: 500, message: "Internal server error" },
  versionMismatch: { code: 426, message: "Version mismatch" },
} as const;

export function sendError(res: ServerResponse, error: ApiError): void {
  sendJson(res, error.code, { status: "error", message: error.message });
}
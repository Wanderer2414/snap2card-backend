import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import { sendJson } from "../shared_functions/send.js";

export const vocabulary_from_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse) => {
  sendJson(req, res, 501, {
    status: "error",
    message: "PDF vocabulary generation is not implemented in Phase 0",
  });
};

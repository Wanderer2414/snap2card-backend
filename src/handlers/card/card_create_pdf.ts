import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardCreate } from "../../definitions/responses.js";
import { parseMultipartFormData } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { saveFile } from "../../shared_functions/file.js";
import { extractPdfText, makePdfExtractArgs } from "../../services/pdf_text_extraction.js";
import { extractWords } from "../../shared_functions/text.js";

export const card_create_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const multipart = await parseMultipartFormData(req);
        const file = multipart?.files.find((item) => item.fieldName === "file");
        if (multipart == null || file == null) {
            sendError(req, res, errors.invalidPdf);
            return;
        }

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const result = await saveFile(file, "pdf", owner);
        if (result == null) {
            sendError(req, res, errors.notFound);
            return;
        }
        const text = await extractPdfText(makePdfExtractArgs(result.source, 100, 1))
        if (text.ok) {
            const words = extractWords(text.text!)
            console.log(words)

        }

        sendResponse(req, res, 201, CardCreate(0, []));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
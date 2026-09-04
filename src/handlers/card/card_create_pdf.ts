import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardCreateItem, CardCreateText } from "../../definitions/responses.js";
import { getRawBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { saveFile } from "../../shared_functions/file.js";
import { converters } from "../../shared_functions/converters.js";
import { extractPdfText, makePdfExtractArgs } from "../../services/pdf_text_extraction.js";
import { extractWords } from "../../shared_functions/text.js";

export const card_create_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const raw = await getRawBody(req);
        const pdf = converters.toPdf(raw);
        if (pdf == null) {
            sendError(req, res, errors.invalidPdf);
            return;
        }

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const result = await saveFile(pdf.data, pdf.fileName, "pdf", owner);
        if (result == null) {
            sendError(req, res, errors.notFound);
            return;
        }
        const text = await extractPdfText(makePdfExtractArgs(result.source, 100, 1))
        if (text.ok) {
            const words = extractWords(text.text!)
            // console.log(words)
        }

        sendResponse(req, res, 201, CardCreateText(2, [CardCreateItem('mandatory', 'required by law'), CardCreateItem('compulsory ', 'that must be done because of a law or a rule')]));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardCreateText, CardCreateItem } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { getVocabularyGenerationService, VocabularyFromText } from "../../services/vocabulary_generation.js";

export const card_create_document_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);

        const generation = await getVocabularyGenerationService().generateFromText(VocabularyFromText(rawBody, 'B1', 20));
        if (!generation.ok) {
            sendError(req, res, generation.error);
            return;
        }

        const cards = generation.data.map((c) => CardCreateItem(c.term, c.definition));
        sendResponse(req, res, 201, CardCreateText(cards.length, cards), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}
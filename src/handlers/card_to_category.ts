import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CardToCategory } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isCategoryIdValid, isValidIds } from "../shared_functions/validate.js";

export const card_to_category_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const category_id = body["categoryId"] as string | undefined;
        const card_ids = body["cardIds"] as string[] | undefined;

        if (!isCategoryIdValid(category_id) || !isValidIds(card_ids)) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        await database_pool.query(
            "CALL CARD_TO_CATEGORY_CATEGORIZE($1, $2);",
            [category_id, card_ids]
        ).catch(
            (e) => { console.log("DB Error: ", e.where); throw e; }
        );

        sendResponse(req, res, 200, CardToCategory());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

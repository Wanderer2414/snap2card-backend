import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CategoryToCard } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isCardIdValid, isValidIds } from "../shared_functions/validate.js";

export const category_to_card_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const card_id = body["cardId"] as string | undefined;
        const category_ids = body["categoryIds"] as string[] | undefined;

        if (!isCardIdValid(card_id) || !isValidIds(category_ids)) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        await database_pool.query(
            "CALL CATEGORY_TO_CARD_CATEGORIZE($1, $2);",
            [card_id, category_ids]
        ).catch(
            (e) => { console.log("DB Error: ", e.where); throw e; }
        );

        sendResponse(req, res, 200, CategoryToCard());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

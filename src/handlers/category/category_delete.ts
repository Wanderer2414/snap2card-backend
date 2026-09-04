import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CategoryDelete } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isCategoryIdValid } from "../../shared_functions/validate.js";

export const category_delete_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const category_id = ctx.query.get("id") ?? undefined;
        if (!isCategoryIdValid(category_id)) {
            sendError(req, res, errors.invalidCategoryIdFormat);
            return;
        }

        await database_pool.query("SELECT * FROM CATEGORY_DELETE($1, $2);", [account_id, category_id]).catch(
            (e) => { console.log("DB Error: ", e.where); throw e; }
        );

        sendResponse(req, res, 200, CategoryDelete());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
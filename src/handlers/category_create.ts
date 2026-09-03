import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CategoryCreate } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isUppercase, isValidLength } from "../shared_functions/validate.js";

export const category_create_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);
        const name = body["name"] as string | undefined;

        if (!isUppercase(name) || !isValidLength(name, 20)) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }

        const created = (
            await database_pool.query("SELECT * FROM CATEGORY_INSERT($1, $2);", [account_id, name]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const category_id = created.rows[0].category_insert as string | null | undefined;
        if (category_id == null) {
            sendError(req, res, errors.notFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, CategoryCreate(category_id), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

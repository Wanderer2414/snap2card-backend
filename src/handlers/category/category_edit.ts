import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CategoryEdit } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isCategoryIdValid, isUppercase, isValidLength } from "../../shared_functions/validate.js";

export const category_edit_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const id = body["id"] as string | undefined;
        const name = body["name"] as string | undefined;

        if (!isCategoryIdValid(id)) {
            sendError(req, res, errors.invalidCategoryIdFormat, rawBody);
            return;
        }
        if (!isUppercase(name) || !isValidLength(name, 20)) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }

        const result = (
            await database_pool.query("SELECT * FROM CATEGORY_EDIT($1, $2, $3);", [account_id, id, name]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (result.rowCount != 1) {
            sendError(req, res, errors.categoryNotFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, CategoryEdit(), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

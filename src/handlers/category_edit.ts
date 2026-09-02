import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CategoryEdit } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";

export const category_edit_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));

        const id = body["id"] as string | undefined;
        const name = body["name"] as string | undefined;

        if (id == undefined || name == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        const result = (
            await database_pool.query("SELECT * FROM CATEGORY_EDIT($1, $2, $3);", [account_id, id, name]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (result.rowCount != 1) {
            sendError(req, res, errors.categoryNotFound);
            return;
        }

        sendResponse(req, res, 200, CategoryEdit());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

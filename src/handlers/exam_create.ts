import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ExamCreate } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isCategoryIdValid } from "../shared_functions/validate.js";

export const exam_create_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const category_id = body["categoryId"] as string | undefined;

        if (!isCategoryIdValid(category_id)) {
            sendError(req, res, errors.invalidCategoryIdFormat);
            return;
        }

        const created = (
            await database_pool.query("SELECT * FROM EXAM_CREATE($1);", [category_id]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const exam_id = created.rows[0].exam_create as string | null | undefined;
        if (exam_id == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        sendResponse(req, res, 200, ExamCreate(exam_id));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

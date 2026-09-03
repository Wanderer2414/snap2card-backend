import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ExamCompleted } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isExamLogIdValid } from "../shared_functions/validate.js";

export const exam_completed_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const exam_log_id = body["examLogId"] as string | undefined;

        if (!isExamLogIdValid(exam_log_id)) {
            sendError(req, res, errors.invalidExamLogIdFormat);
            return;
        }

        await database_pool.query("CALL EXAM_COMPLETED($1);", [exam_log_id]).catch(
            (e) => { console.log("DB Error: ", e.where); throw e; }
        );

        sendResponse(req, res, 200, ExamCompleted());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

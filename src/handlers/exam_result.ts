import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ExamResult } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isExamLogIdValid, isQuizIdValid } from "../shared_functions/validate.js";

export const exam_result_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const exam_log_id = body["examLogId"] as string | undefined;
        const quiz_id = body["quizId"] as string | undefined;
        const result = body["result"] as boolean | undefined;

        if (!isExamLogIdValid(exam_log_id) || !isQuizIdValid(quiz_id) || typeof result !== "boolean") {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        await database_pool.query("CALL EXAM_LOG_REVIEW_RESULT($1, $2, $3);", [exam_log_id, quiz_id, result]).catch(
            (e) => { console.log("DB Error: ", e.where); throw e; }
        );

        sendResponse(req, res, 200, ExamResult());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

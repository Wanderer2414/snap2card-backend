import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ExamStart } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isExamIdValid } from "../shared_functions/validate.js";

export const exam_start_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null || ctx.token == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);
        const exam_id = body["examId"] as string | undefined;

        if (!isExamIdValid(exam_id)) {
            sendError(req, res, errors.invalidExamIdFormat, rawBody);
            return;
        }

        const log = (
            await database_pool.query("SELECT * FROM EXAM_START($1, $2);", [ctx.token, exam_id]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        if (log.rows[0]?.exam_start == null) {
            sendError(req, res, errors.notFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, ExamStart(), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

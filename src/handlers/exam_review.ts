import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ExamQuizItem, ExamReview } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isExamIdValid } from "../shared_functions/validate.js";

export const exam_review_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));
        const exam_id = body["examId"] as string | undefined;

        if (!isExamIdValid(exam_id)) {
            sendError(req, res, errors.invalidExamIdFormat);
            return;
        }

        const quizzes = (
            await database_pool.query("SELECT * FROM EXAM_REVIEW_RETRIEVE($1);", [exam_id]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const output: ExamQuizItem[] = [];
        quizzes.rows.forEach((row) => {
            output.push(ExamQuizItem(row["quiz_id"], row["frontside"], row["backside"]));
        });

        sendResponse(req, res, 200, ExamReview(output.length, output));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

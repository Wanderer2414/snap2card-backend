import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import {
    ReviewLogQuizResultItem,
    ReviewLogDetailItem,
    ReviewLogDetail,
    Time,
} from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isExamLogIdValid } from "../../shared_functions/validate.js";

interface RawQuizResult {
    quiz_id: string;
    front_text: string;
    back_text: string;
    account_answer: boolean;
    result_score: number;
    total_score: number;
}

export const exam_review_log_detail_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const exam_log_id = ctx.query.get("examLogId") ?? undefined;
        if (!isExamLogIdValid(exam_log_id)) {
            sendError(req, res, errors.invalidExamLogIdFormat);
            return;
        }

        const result = (
            await database_pool.query(
                "SELECT Q.*, to_jsonb(Q.quiz_results) AS quiz_results_json FROM REVIEW_LOG_DETAIL_RETRIEVE($1) AS Q;",
                [exam_log_id]
            ).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const row = result.rows[0];
        if (row == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        const quizResults: ReviewLogQuizResultItem[] = ((row["quiz_results_json"] ?? []) as RawQuizResult[]).map((q) =>
            ReviewLogQuizResultItem(q.quiz_id, q.front_text, q.back_text, q.account_answer, q.result_score, q.total_score)
        );

        const item = ReviewLogDetailItem(
            row["log_id"],
            row["exam_name"],
            row["exam_level"],
            row["result_score"],
            row["total_score"],
            row["num_of_quiz"],
            Time(row["year_done"], row["month_done"], row["day_done"], row["hour_done"], row["minute_done"], row["second_done"], row["gmt_done"]),
            quizResults
        );

        sendResponse(req, res, 200, ReviewLogDetail(item));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
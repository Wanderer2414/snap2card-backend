import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CategoryLogItem, CategoryLogRelated, Time } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isCategoryIdValid } from "../../shared_functions/validate.js";

export const category_log_related_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const category_id = ctx.query.get("categoryId") ?? undefined;

        if (!isCategoryIdValid(category_id)) {
            sendError(req, res, errors.invalidCategoryIdFormat);
            return;
        }

        const logs = (
            await database_pool.query(
                "SELECT * FROM CATEGORY_LOG_RELATED($1, $2);",
                [account_id, category_id]
            ).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const output: CategoryLogItem[] = [];
        logs.rows.forEach((row) => {
            output.push(
                CategoryLogItem(
                    row["log_id"],
                    row["exam_name"],
                    row["score"],
                    row["total_score"],
                    Time(row["year_start"], row["month_start"], row["day_start"], row["hour_start"], row["minute_start"], row["second_start"], row["gmt_start"]),
                    Time(row["year_end"], row["month_end"], row["day_end"], row["hour_end"], row["minute_end"], row["second_end"], row["gmt_end"])
                )
            );
        });

        sendResponse(req, res, 200, CategoryLogRelated(output));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
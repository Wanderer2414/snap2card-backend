import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { MonthlyLearnedCount, MonthlyLearnedCountItem } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";

export const monthly_learned_count_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const result = (
            await database_pool.query("SELECT * FROM MONTHLY_LEARNED_COUNT($1);", [account_id]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const output: MonthlyLearnedCountItem[] = [];
        result.rows.forEach((row) => {
            output.push(
                MonthlyLearnedCountItem(
                    row["day"],
                    row["card_count"]
                )
            );
        });

        sendResponse(req, res, 200, MonthlyLearnedCount(output));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

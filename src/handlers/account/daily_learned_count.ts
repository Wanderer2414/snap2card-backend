import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { DailyLearnedCount } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";

export const daily_learned_count_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const year = ctx.query.get("year") ?? undefined;
        const month = ctx.query.get("month") ?? undefined;
        const day = ctx.query.get("day") ?? undefined;
        const yearNum = Number(year);
        const monthNum = Number(month);
        const dayNum = Number(day);
        if (
            !Number.isInteger(yearNum) || yearNum < 1000 || yearNum > 9999 ||
            !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12 ||
            !Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31
        ) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        const date = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

        const result = (
            await database_pool.query("SELECT * FROM DAILY_LEARNED_COUNT($1, $2);", [account_id, date]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const count = Number(result.rows[0]?.daily_learned_count ?? 0);
        sendResponse(req, res, 200, DailyLearnedCount(count));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

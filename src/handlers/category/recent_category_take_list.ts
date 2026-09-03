import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { RecentCategoryItem, RecentCategoryTakeList, Time } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";

export const recent_category_take_list_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const n = ctx.query.get("n") ?? "10";
        const nNum = Number(n);
        if (!Number.isInteger(nNum) || nNum <= 0) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        const categories = (
            await database_pool.query("SELECT * FROM RECENT_CATEGORY_TAKE_LIST($1, $2);", [account_id, nNum]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const output: RecentCategoryItem[] = [];
        categories.rows.forEach((row) => {
            output.push(
                RecentCategoryItem(
                    row["category_id"],
                    row["category_name"],
                    row["mastery"] as number | null,
                    Time(row["year"], row["month"], row["day"], row["hour"], row["minute"], row["second"], row["gmt"])
                )
            );
        });

        sendResponse(req, res, 200, RecentCategoryTakeList(output));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

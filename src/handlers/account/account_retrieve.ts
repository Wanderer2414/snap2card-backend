import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { AccountRetrieve, Time } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";

export const account_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const account = (
            await database_pool.query("SELECT * FROM ACCOUNT_RETRIEVE($1);", [account_id]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (account.rowCount != 1) {
            sendError(req, res, errors.notFound);
            return;
        }

        const row = account.rows[0];
        sendResponse(
            req, res, 200,
            AccountRetrieve(
                row["account_email"],
                row["account_name"],
                row["account_phone"],
                row["account_daily_goal"],
                Time(row["year"], row["month"], row["day"], row["hour"], row["minute"], row["second"], row["gmt"])
            )
        );
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

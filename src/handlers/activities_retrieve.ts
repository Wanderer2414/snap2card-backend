import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { ActivitiesRetrieve } from "../definitions/responses.js";
import { checkSession } from "../shared_functions/check_session.js";

export const activities_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const activities = (
            await database_pool.query("SELECT * FROM ACTIVITIES_RETRIEVE($1);", [account_id]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const row = activities.rows[0];
        if (row == undefined) {
            sendError(req, res, errors.notFound);
            return;
        }

        sendResponse(
            req, res, 200,
            ActivitiesRetrieve(
                row["streak"],
                row["cards_this_month"],
                row["offset"],
                row["counts"]
            )
        );
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

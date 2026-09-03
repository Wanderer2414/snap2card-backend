import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { HistoryItem, HistoryRetrieve, Time } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";

export const history_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const from = ctx.query.get("from") ?? null;
        const to = ctx.query.get("to") ?? null;
        const limit = ctx.query.get("limit") ?? undefined;
        const page = ctx.query.get("page") ?? undefined;

        const history = (
            await database_pool.query(
                "SELECT * FROM HISTORY_RETRIEVE($1, $2, $3, $4, $5);",
                [account_id, from, to, limit ?? "50", page ?? "1"]
            ).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const rows = history.rows;
        const output: HistoryItem[] = [];
        rows.forEach((row) => {
            output.push(
                HistoryItem(
                    row["id"],
                    row["card_id"],
                    row["amount"],
                    row["currency"],
                    row["description"],
                    Time(row["year"], row["month"], row["day"], row["hour"], row["minute"], row["second"], row["gmt"])
                )
            );
        });

        const pageNum = page == null ? 1 : Number(page);
        const limitNum = limit == null ? 50 : Number(limit);
        sendResponse(req, res, 200, HistoryRetrieve(output, pageNum, limitNum, output.length));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
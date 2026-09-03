import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { HistoryItem, HistoryRetrieve, Time } from "../definitions/responses.js";
import { checkSession } from "../shared_functions/check_session.js";
import { getBody } from "../shared_functions/request.js";

export const history_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);
        const from = (body["from"] as string | undefined) ?? null;
        const to = (body["to"] as string | undefined) ?? null;
        const limit = body["limit"] as string | undefined;
        const page = body["page"] as string | undefined;

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
        sendResponse(req, res, 200, HistoryRetrieve(output, pageNum, limitNum, output.length), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

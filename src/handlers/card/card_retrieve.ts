import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardRetrieve, CardRetrieveItem } from "../../definitions/responses.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isValidIds } from "../../shared_functions/validate.js";

export const card_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const idsParam = ctx.query.get("ids");
        const card_id = idsParam != null && idsParam.length > 0 ? idsParam.split(",") : undefined;

        if (!isValidIds(card_id)) {
            sendError(req, res, errors.invalidCardIdFormat);
            return;
        }

        const cards = (
            await database_pool.query("SELECT * FROM CARD_RETRIEVE($1);", [card_id]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        const output: CardRetrieveItem[] = []
        cards.rows.forEach((row) => {
            output.push(CardRetrieveItem(row["card_id"], row["frontside_text"], row["backside_text"]))
        })
        sendResponse(req, res, 200, CardRetrieve(output))
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, resolveDatabaseError(e))
    }
}
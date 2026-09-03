import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardRetrieve, CardRetrieveItem } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isValidIds } from "../../shared_functions/validate.js";

export const card_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);
        const card_id = body["ids"] as string[] | undefined;

if (!isValidIds(card_id)) {
            sendError(req, res, errors.invalidCardIdFormat, rawBody);
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
        sendResponse(req, res, 200, CardRetrieve(output), rawBody)
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, resolveDatabaseError(e), rawBody)
    }
}
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CategoryRetrieve, Time } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isCategoryIdValid } from "../../shared_functions/validate.js";

export const category_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);
        const category_id = body["id"] as string | undefined;

        if (!isCategoryIdValid(category_id)) {
            sendError(req, res, errors.invalidCategoryIdFormat, rawBody);
            return;
        }   

        const categories = (
            await database_pool.query("SELECT * FROM CATEGORY_RETRIEVE($1, $2);", [account_id, category_id]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        
        const row = categories.rows[0]
        const cardIds = typeof row["card_ids"] === "string"
                            ? row["card_ids"]
                                .replace(/^\{|\}$/g, "")
                                .split(",")
                            : row["card_ids"] ?? [];


        sendResponse(
            req, res, 200,
            CategoryRetrieve(
                row["category_name"],
                row["numofcard"],
                Time(row["year"], row["month"], row["day"], row["hour"], row["minute"], row["second"], row["gmt"]),
                cardIds
            ),
            rawBody
        )
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, resolveDatabaseError(e), rawBody)
    }
}
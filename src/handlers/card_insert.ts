import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors } from "../configs/errors.js";
import { getBody } from "../shared_functions/request.js";

export const card_insert_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const cards = (
            await database_pool.query("SELECT * FROM CARD_LIST($1);", [ctx.token!]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        const numOfCard = cards.rowCount
        let output: Record<string, any>[] = []
        cards.rows.forEach((row) => {
            output.push({ "id": row["card_id"], "frontSide": row["component_text"]})
        })
        sendJson(req, res, 200, {
            "data": {
                "numOfCard": numOfCard,
                "cards": output
                }
            }
        )
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, errors.notFound)
    }
}
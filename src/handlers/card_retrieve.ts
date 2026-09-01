import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors } from "../configs/errors.js";
import { getBody } from "../shared_functions/request.js";

export const card_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const body = JSON.parse(await getBody(req));
        const card_id = body["ids"] as string[] | undefined;

        if (card_id == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }   

        const cards = (
            await database_pool.query("SELECT * FROM CARD_RETRIEVE($1);", [card_id!]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        let output: Record<string, any>[] = []
        cards.rows.forEach((row) => {
            output.push({ "id": row["card_id"], "frontSide": row["frontside_text"], "backside":row["backside_text"]})
        })
        sendJson(req, res, 200, { "data": output })
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, errors.notFound)
    }
}
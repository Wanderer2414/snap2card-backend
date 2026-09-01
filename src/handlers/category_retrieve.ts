import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors } from "../configs/errors.js";
import { getBody } from "../shared_functions/request.js";

export const category_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const body = JSON.parse(await getBody(req));
        const category_id = body["id"] as string | undefined;

        if (category_id == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }   

        const categories = (
            await database_pool.query("SELECT * FROM CATEGORY_RETRIEVE($1, $2);", [ctx.token!, category_id]).catch(
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


        sendJson(req, res, 200, {
            "data": {
                "name": row["category_name"],
                "numOfCard": row["numofcard"],
                "cardIds": cardIds,
                "createdAt": {
                    "year": row["year"],
                    "month": row["month"],
                    "day": row["day"],
                    "hour": row["hour"],
                    "minute": row["minute"],
                    "second": row["second"],
                    "gmt": row["gmt"]}
                }
            }
        )
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, errors.notFound)
    }
}
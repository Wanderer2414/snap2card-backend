import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors } from "../configs/errors.js";
import { getBody } from "../shared_functions/request.js";

export const category_list_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const body = JSON.parse(await getBody(req));

        const categories = (
            await database_pool.query("SELECT * FROM CATEGORY_LIST($1);", [ctx.token!]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        const numOfCat = categories.rowCount
        let output: Record<string, any>[] = []
        categories.rows.forEach((row) => {
            output.push({ "id": row["category_id"], "name": row["category_name"], "createdAt": {
                "year": row["year"],
                "month": row["month"],
                "day": row["day"],
                "hour": row["hour"],
                "minute": row["minute"],
                "second": row["second"],
                "gmt": row["gmt"]}})
        })
        sendJson(req, res, 200, {
            "data": {
                "categoryNum": numOfCat,
                "categories": output
                }
            }
        )
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, errors.notFound)
    }
}
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CategoryItem, CategoryList, Time } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";

export const category_list_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }
        const categories = (
            await database_pool.query("SELECT * FROM CATEGORY_LIST($1);", [account_id]).catch(
                (e) => {
                    console.log("DB Error: ", e.where)
                    throw e
                }
            )
        )
        const numOfCat = categories.rowCount
        const output: CategoryItem[] = []
        categories.rows.forEach((row) => {
            output.push(
                CategoryItem(
                    row["category_id"],
                    row["category_name"],
                    row["numofcard"],
                    Time(row["year"], row["month"], row["day"], row["hour"], row["minute"], row["second"], row["gmt"])
                )
            )
        })
        sendResponse(req, res, 200, CategoryList(numOfCat ?? 0, output))
    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, resolveDatabaseError(e))
    }
}
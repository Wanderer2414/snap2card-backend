import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors } from "../configs/errors.js";
import { getBody } from "../shared_functions/request.js";

export const login_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    const body = JSON.parse(await getBody(req));
    
    const email = body["email"] as string | undefined;
    const password = body["password"] as string | undefined;

    if ((email == undefined) || (password == undefined)) {
        sendError(req, res, errors.invalidEmailOrPassword);
        return;
    }   

    const id = await database_pool.query("SELECT FN_ACCOUNT_LOGIN($1, $2);", [email, password])
    if ((id.rowCount != 1) || id.rows[0].fn_account_login == null) {
        sendError(req, res, errors.invalidEmailOrPassword);
        return;
    }
    sendJson(req, res, 200, {"token": id.rows[0].fn_account_login})
}
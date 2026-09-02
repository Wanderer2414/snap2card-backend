import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { AccountLogin } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { isValidEmail, isValidLength } from "../shared_functions/validate.js";

export const login_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => { 
    try {
        const body = JSON.parse(await getBody(req));
        
        const email = body["email"] as string | undefined;
        const password = body["password"] as string | undefined;

        if (!isValidEmail(email) || !isValidLength(password, 100)) {
            sendError(req, res, errors.invalidEmailOrPassword);
            return;
        }   

        const id = await database_pool.query("SELECT * FROM ACCOUNT_LOGIN($1, $2);", [email, password])
        if ((id.rowCount != 1) || id.rows[0].account_login == null) {
            sendError(req, res, errors.invalidEmailOrPassword);
            return;
        }
        sendResponse(req, res, 200, AccountLogin(id.rows[0].account_login))

    }
    catch (e) {
        console.log("Error: ", e)
        sendError(req, res, resolveDatabaseError(e))
    }
}
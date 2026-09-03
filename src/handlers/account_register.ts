import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { AccountRegister } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { isValidEmail, isValidLength } from "../shared_functions/validate.js";

export const account_register_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const name = body["name"] as string | undefined;
        const email = body["email"] as string | undefined;
        const phone = body["phone"] as string | undefined;
        const password = body["password"] as string | undefined;

        if (!isValidLength(name, 60) || !isValidEmail(email) || !isValidLength(password, 100) || !isValidLength(phone, 20)) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }

        const created = (
            await database_pool.query("SELECT * FROM ACCOUNT_INSERT($1, $2, $3, $4);", [name, email, phone, password]).catch(
                (e) => { console.log("DB Error: ", e.where); throw e; }
            )
        );

        const account_id = created.rows[0].account_insert as string | null | undefined;
        if (account_id == null) {
            sendError(req, res, errors.notFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, AccountRegister(account_id), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

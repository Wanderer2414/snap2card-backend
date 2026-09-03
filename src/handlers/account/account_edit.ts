import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { AccountEdit } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isValidEmail, isValidLength } from "../../shared_functions/validate.js";

export const account_edit_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const type = body["type"] as string | undefined;
        const name = body["name"] as string | undefined;
        const email = body["email"] as string | undefined;
        const phone = body["phone"] as string | undefined;
        const dailyGoal = body["dailyGoal"] as number | undefined;

        if (type == undefined) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }
        if (name != undefined && !isValidLength(name, 60)) {
            sendError(req, res, errors.fieldTooLong("name", 60), rawBody);
            return;
        }
        if (email != undefined && !isValidEmail(email)) {
            sendError(req, res, errors.invalidEmailFormat, rawBody);
            return;
        }

        const result = (
            await database_pool.query(
                "SELECT * FROM UPDATE_ACCOUNT($1, $2, $3, $4, $5, $6);",
                [account_id, name ?? null, email ?? null, phone ?? null, null, dailyGoal ?? null]
            ).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (result.rowCount != 1) {
            sendError(req, res, errors.notFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, AccountEdit(), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { AccountEdit } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";

export const account_edit_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const body = JSON.parse(await getBody(req));

        const type = body["type"] as string | undefined;
        const name = body["name"] as string | undefined;
        const email = body["email"] as string | undefined;
        const phone = body["phone"] as string | undefined;

        if (type == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        let fields: string[] = [];
        let values: unknown[] = [];

        if (type === "total" || type === "name") {
            if (name !== undefined) { fields.push(`name = $${fields.length + 1}`); values.push(name); }
        }
        if (type === "total" || type === "email") {
            if (email !== undefined) { fields.push(`email = $${fields.length + 1}`); values.push(email); }
        }
        if (type === "total" || type === "phone") {
            if (phone !== undefined) { fields.push(`phone = $${fields.length + 1}`); values.push(phone); }
        }

        if (fields.length === 0) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        values.push(account_id);
        const query = `UPDATE ACCOUNT SET ${fields.join(", ")} WHERE id = $${values.length};`;

        const result = (
            await database_pool.query(query, values).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (result.rowCount != 1) {
            sendError(req, res, errors.notFound);
            return;
        }

        sendResponse(req, res, 200, AccountEdit());
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

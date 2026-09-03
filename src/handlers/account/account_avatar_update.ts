import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { AccountEdit } from "../../definitions/responses.js";
import { getRawBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { saveFile } from "../../shared_functions/file.js";
import { converters } from "../../shared_functions/converters.js";

export const account_avatar_update_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const raw = await getRawBody(req);
        const image = converters.toImage(raw);
        if (image == null) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        const saved = await saveFile(image.data, image.fileName, image.extension, account_id);
        if (saved == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        const result = (
            await database_pool.query(
                "SELECT * FROM UPDATE_ACCOUNT($1, $2, $3, $4, $5, $6);",
                [account_id, null, null, null, saved.fileId, null]
            ).catch(
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

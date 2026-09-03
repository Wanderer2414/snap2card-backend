import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CardEdit } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isValidId, isValidIds } from "../shared_functions/validate.js";

export const card_edit_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const id = body["id"] as string | undefined;
        const frontSide = body["frontSide"] as string | undefined;
        const backSide = body["backSide"] as string | undefined;
        const categories = body["categories"] as string[] | undefined;

        if (!isValidId(id)) {
            sendError(req, res, errors.invalidCardIdFormat, rawBody);
            return;
        }
        if (categories != undefined && !isValidIds(categories)) {
            sendError(req, res, errors.invalidCategoryIdFormat, rawBody);
            return;
        }

        const result = (
            await database_pool.query(
                "SELECT * FROM CARD_EDIT($1, $2, $3, $4);",
                [id, frontSide ?? null, backSide ?? null, categories ?? null]
            ).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        if (result.rowCount != 1) {
            sendError(req, res, errors.cardNotFound, rawBody);
            return;
        }

        sendResponse(req, res, 200, CardEdit(), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

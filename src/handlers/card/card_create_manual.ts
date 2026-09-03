import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardCreate, CardListItem } from "../../definitions/responses.js";
import { getBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { isValidId } from "../../shared_functions/validate.js";
import { createComponent } from "./card_create.js";

export const card_create_manual_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const frontSide = body["frontSide"] as string | undefined;
        const backSide = body["backSide"] as string | undefined;

        if (frontSide == undefined || backSide == undefined) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }
        if (frontSide === backSide) {
            sendError(req, res, errors.frontAndBackSame, rawBody);
            return;
        }

        const front_id = await createComponent(frontSide, owner);
        const back_id = await createComponent(backSide, owner);
        if (!isValidId(front_id) || !isValidId(back_id)) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }
        const card = (
            await database_pool.query("SELECT * FROM CARD_INSERT($1, $2, $3);", [front_id, back_id, owner]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );
        if (card.rows[0].card_insert != null)
            sendResponse(req, res, 201, CardCreate(card.rowCount!, [CardListItem(card.rows[0].card_id, frontSide)]), rawBody);
        else
            sendResponse(req, res, 201, CardCreate(0, []), rawBody);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendJson, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CardCreate, CardListItem } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { isValidId } from "../shared_functions/validate.js";

async function createComponent(text: string, owner: string): Promise<string> {
    const created = (
        await database_pool.query("SELECT * FROM COMPONENT_INSERT($1, $2);", [text, owner]).catch(
            (e) => { console.log("DB Error: ", e); throw e; }
        )
    );
    return created.rows[0].component_insert as string;
}

export async function create_card_manual(req: IncomingMessage, res: ServerResponse, ctx: RouteContext, frontSide: string, backSide: string, owner: string, rawBody?: string) {
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

export const card_create_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    let rawBody: string | undefined;
    try {
        rawBody = await getBody(req);
        const body = JSON.parse(rawBody);

        const type = body["type"] as string | undefined;

        if (type == undefined) {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }

        let frontSide: string | undefined;
        let backSide: string | undefined;

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }


        if (type === "manual") {
            frontSide = body["frontSide"] as string | undefined;
            backSide = body["backSide"] as string | undefined;
            if (frontSide == undefined || backSide == undefined) {
                sendError(req, res, errors.invalidInputData, rawBody)
                return;
            }
            if (frontSide === backSide) {
                sendError(req, res, errors.frontAndBackSame, rawBody);
                return;
            }
            await create_card_manual(req, res, ctx, frontSide!, backSide!, owner, rawBody)
            return;

        } else if (type === "document") {
            const text = body["text"] as string | undefined;
            if (text == undefined) {
                sendError(req, res, errors.invalidInputData, rawBody);
                return;
            }
            console.log(text)
            sendJson(req, res, 501, { status: "error", message: "Not implemented" }, rawBody);
            backSide = text;
        } else if (type === "image") {
            sendJson(req, res, 501, { status: "error", message: "Not implemented" }, rawBody);
            const image = body["image"] as { image?: string } | undefined;
            if (image?.image == undefined) {
                sendError(req, res, errors.invalidInputData, rawBody);
                return;
            }
            backSide = image.image;
        } else {
            sendError(req, res, errors.invalidInputData, rawBody);
            return;
        }

    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e), rawBody);
    }
}

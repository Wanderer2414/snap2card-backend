import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CardCreate } from "../definitions/responses.js";
import { getBody } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";

async function createComponent(text: string, owner: string): Promise<string> {
    const created = (
        await database_pool.query("SELECT * FROM COMPONENT_INSERT($1, $2);", [text, owner]).catch(
            (e) => { console.log("DB Error: ", e); throw e; }
        )
    );
    return created.rows[0].component_insert as string;
}

export const card_create_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const body = JSON.parse(await getBody(req));

        const name = body["name"] as string | undefined;
        const type = body["type"] as string | undefined;

        if (name == undefined || type == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        let frontSide: string | undefined;
        let backSide: string | undefined;

        if (type === "manual") {
            frontSide = body["frontSide"] as string | undefined;
            backSide = body["backSide"] as string | undefined;
        } else if (type === "document") {
            const text = body["text"] as string | undefined;
            if (text == undefined) {
                sendError(req, res, errors.invalidInputData);
                return;
            }
            frontSide = `${name}`;
            backSide = text;
        } else if (type === "image") {
            const image = body["image"] as { image?: string } | undefined;
            if (image?.image == undefined) {
                sendError(req, res, errors.invalidInputData);
                return;
            }
            frontSide = `${name}`;
            backSide = image.image;
        } else {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        if (frontSide == undefined || backSide == undefined) {
            sendError(req, res, errors.invalidInputData);
            return;
        }

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const front_id = await createComponent(frontSide, owner);
        const back_id = await createComponent(backSide, owner);

        const card = (
            await database_pool.query("SELECT * FROM CARD_INSERT($1, $2, $3);", [front_id, back_id, owner]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        sendResponse(req, res, 201, CardCreate(card.rows[0].card_insert));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

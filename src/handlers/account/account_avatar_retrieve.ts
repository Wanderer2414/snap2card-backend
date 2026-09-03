import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError } from "../../shared_functions/send.js";
import database_pool from "../../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { LocalStorage } from "../../shared_functions/storage.js";

export const account_avatar_retrieve_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const account_id = await checkSession(ctx.token);
        if (account_id == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const avatar = (
            await database_pool.query("SELECT * FROM ACCOUNT_AVATAR_RETRIEVE($1);", [account_id]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const fileId = avatar.rows[0]?.account_avatar_retrieve as string | null | undefined;
        if (fileId == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        const file = (
            await database_pool.query("SELECT * FROM FILE_RETRIEVE($1);", [fileId]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const source = file.rows[0]?.file_source as string | null | undefined;
        if (source == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        const data = await LocalStorage.read(source);
        if (data == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        res.writeHead(200, { "Content-Type": "image/png", "Content-Length": data.length });
        res.end(data);
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}

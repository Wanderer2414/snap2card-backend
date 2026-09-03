import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../shared_type/handler.js";
import type { RouteContext } from "../controllers/router.js";
import { sendError, sendResponse } from "../shared_functions/send.js";
import database_pool from "../controllers/db_router.js";
import { errors, resolveDatabaseError } from "../configs/errors.js";
import { CardCreate } from "../definitions/responses.js";
import { parseMultipartFormData } from "../shared_functions/request.js";
import { checkSession } from "../shared_functions/check_session.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const card_create_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const multipart = await parseMultipartFormData(req);
        const file = multipart?.files.find((item) => item.fieldName === "file");
        if (multipart == null || file == null) {
            sendError(req, res, errors.invalidPdf);
            return;
        }

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const dir = path.join(process.cwd(), "files");
        await mkdir(dir, { recursive: true });

        const filename = `${Date.now()}_${file.filename}`;
        const filePath = path.join(dir, filename);
        await writeFile(filePath, file.data);

        const source = `/files/${filename}`;
        const created = (
            await database_pool.query("SELECT * FROM FILE_INSERT($1, $2, $3);", [source, "pdf", owner]).catch(
                (e) => { console.log("DB Error: ", e); throw e; }
            )
        );

        const file_id = created.rows[0].file_insert as string | null | undefined;
        if (file_id == null) {
            sendError(req, res, errors.notFound);
            return;
        }

        sendResponse(req, res, 201, CardCreate(0, []));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
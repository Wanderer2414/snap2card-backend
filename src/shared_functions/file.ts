import { createHash } from "node:crypto";
import path from "node:path";
import { LocalStorage } from "./storage.js";
import database_pool from "../controllers/db_router.js";

function sha256(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
}

export interface FileSaveResult {
    fileId: string;
    source: string;
    fileName: string;
    hashCode: string;
    fileType: string;
}

export async function saveFile(data: Buffer, fileName: string, fileType: string, ownerId: string): Promise<FileSaveResult | null> {
    const hashCode = sha256(data);
    const safeName = path.basename(fileName.slice(0, 60));

    const created = (
        await database_pool.query(
            "SELECT * FROM FILE_INSERT($1, $2, $3, $4);",
            [safeName, hashCode, fileType, ownerId]
        ).catch(
            (e) => { console.log("DB Error: ", e); throw e; }
        )
    );

    const fileId = created.rows[0].file_id as string | null | undefined;
    let source = created.rows[0].file_source as string | null | undefined;
    if (fileId == null || source == null) {
        return null;
    }

    const alreadyExists = await LocalStorage.exists(source);
    if (!alreadyExists) {
        await LocalStorage.save(path.basename(source), data);
    }
    source = LocalStorage.getAbsPath(source)

    return { fileId, source, fileName: safeName, hashCode, fileType };
}
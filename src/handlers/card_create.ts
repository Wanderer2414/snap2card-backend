import database_pool from "../controllers/db_router.js";

export async function createComponent(text: string, owner: string): Promise<string> {
    const created = (
        await database_pool.query("SELECT * FROM COMPONENT_INSERT($1, $2);", [text, owner]).catch(
            (e) => { console.log("DB Error: ", e); throw e; }
        )
    );
    return created.rows[0].component_insert as string;
}
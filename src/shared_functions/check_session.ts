import database_pool from "../controllers/db_router.js";

export async function checkSession(token: string | null): Promise<string | null> {
    if (token == null) return null;

    const session = await database_pool.query("SELECT * FROM SESSION_CHECK($1);", [token]);
    const account_id = session.rows[0]?.session_check as string | null | undefined;
    return account_id ?? null;
}
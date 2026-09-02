import { Pool } from "pg";
import { getPassword } from "../shared_functions/certificate.js";

const database_pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "snap2card",
    password: getPassword(),
    database: "snap2card"

})

export default database_pool;
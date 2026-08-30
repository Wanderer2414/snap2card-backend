import { Pool } from "pg";

import readlineSync from "readline-sync";

const password = readlineSync.question("Snap2card password: ", {
  hideEchoBack: true,
});

const database_pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "snap2card",
    password: password,
    database: "snap2card"

})
export default database_pool;
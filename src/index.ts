import https from "node:https";
import fs from "node:fs";
import { router } from "./controllers/router.js";
import { handlers } from "./configs/config.js";
import readlineSync from "readline-sync"
const port = readlineSync.questionInt("Port: ");
const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.crt"),
};

console.log("Start listening on port ", port, "!")

const server = https.createServer(options, (req, res) => {
  router.route(req, res, handlers);
});
server.listen(port, "::");
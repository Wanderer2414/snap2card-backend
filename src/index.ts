import https from "node:https";
import fs from "node:fs";
import { router } from "./controllers/router.js";
import { handlers } from "./configs/config.js";

const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.crt"),
};

const server = https.createServer(options, (req, res) => {
  router.route(req, res, handlers);
});
server.listen(443, "::");
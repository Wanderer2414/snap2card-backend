import https from "node:https";
import fs from "node:fs"


const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.crt"),
};

const server = https.createServer(options, (req, res) => {
    res.writeHead(200, "success")
    res.end("Helloworld")
})
server.listen(8000, "::")
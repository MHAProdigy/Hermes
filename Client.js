require("dotenv").config();

const KeyvLib = require("keyv");
const Keyv = new KeyvLib(process.env.DATABASE);

const MulticraftAPI = require("multicraft-api-node");
const fs = require("fs");
const fetch = require("node-fetch");
const md5 = require("md5");
const session = require("express-session");
const express = require("express");
const app = express();

require("./ErrorHandler");

const panelAPI = new MulticraftAPI({
    url: process.env.PEBBLE_URL,
    user: process.env.PEBBLE_USER,
    key: process.env.PEBBLE_KEY
});

Object.prototype.getKeyByValue = function(value) {
    return Object.keys(this).find(key => this[key] === value);
}

Keyv.on("error", console.error);
const Data = {};
module.exports = {
    Data: Data,
    Keyv: Keyv,
    panelAPI: panelAPI
};

const Config = require("./Config");

const archive = [];
function addArchive(folder) {
    if (archive.includes(archive)) return;
    app.use("/archive/" + folder, express.static("../archive/" + folder));
    archive.push(folder);
}
if (fs.existsSync("../archive")) {
    fs.readdirSync("../archive").forEach(addArchive);
}

app.use(express.static("views"));
app.use(session({
    // Random long string.
    secret: md5(Date.now()),
    cookie: {},
    resave: true,
    saveUninitialized: true
}));

const routes = {};
const path = "./routes";
fs.readdirSync(path)
    .filter(file => file.endsWith(".js") && !file.startsWith("#"))
    .forEach(fileName => routes[fileName.substring(0, fileName.indexOf("."))] = require(path + "/" + fileName));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log("Webserver running on port: " + PORT);
    await fetch(Config.viberAPI + "set_webhook", {
        method: "POST",
        body: JSON.stringify({url: Config.host + "viber/webhook", event_types: []}),
        headers: {"X-Viber-Auth-Token": process.env.VIBER_BOT_TOKEN}
    });

    // Save env to Data.
    if (fs.existsSync("downloadedEnv.txt") || !process.env.ENV_GIST) return;
    const gist = await fetch("https://api.github.com/gists/" + process.env.ENV_GIST).then(y => y.json());
    const rawURL = gist?.files?.[".env"]?.["raw_url"];
    const file = rawURL ? await fetch(rawURL).then(y => y.text()) : "";
    fs.writeFileSync("downloadedEnv.txt", file);
});

app.get("/archive", (request, response) => {
    response.send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Archive</title>
            </head>
            <body>
                <h1>Index of /</h1>
                <pre>${archive.map(folder => `<img src="/_autoindex/icons/folder.png" alt="directory"><a href="https://mhaprodigy.uk/archive/${folder}">${folder}</a><br>`).join("\n")}</pre>
                <hr>
            </body>
        </html>
    `);
});
app.get("/addarchive/:id", async (request, response) => {
    addArchive(request.params.id);
    response.end();
});
app.get("/:route", async (request, response, next) => {
    const {route} = request.params;
    if (routes.hasOwnProperty(route)) await routes[route](request, response);
    else next();
});
app.post("/viber/webhook", (_, response) => {
    response.sendStatus(200);
});

app.get("*", (request, response) => {
    response.status(404);
    response.send(`
        <!doctype html>
        <html lang="en">
            <head><title>Error Page</title></head>
            <body><img src="https://http.cat/404.jpg" alt="404 not found"></body>
        </html>
    `);
});

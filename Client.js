require("dotenv").config();

const KeyvLib = require("keyv");
const Keyv = new KeyvLib(process.env.DATABASE);

const fs = require("fs");
const fetch = require("node-fetch");
const md5 = require("md5");
const session = require("express-session");
const express = require("express");
const app = express();

Object.prototype.getKeyByValue = function(value) {
    return Object.keys(this).find(key => this[key] === value);
}

Keyv.on("error", console.error);
const Data = {};
module.exports = {Data: Data, Keyv: Keyv};

const Config = require("./Config");

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
});

app.get("/:route", async (request, response) => {
    const route = request.params.route;
    if (routes.hasOwnProperty(route)) await routes[route](request, response);
    else response.end();
});
app.post("/viber/webhook", (_, response) => {
    response.sendStatus(200);
});

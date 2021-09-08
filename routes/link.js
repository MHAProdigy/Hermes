const atob = require("atob");

const {Keyv, Data} = require("../Client");
const Util = require("../Util");
const Config = require("../Config");

module.exports = async (request, response) => {
    let db = await Keyv.get("minecraft") || {};

    if (!request.query.code) {
        // If nothing was specified, exit.
        if (!request.query["uuid"]) {
            response.sendFile("/views/discordLinking/invalid.html", {root: "."});
            return;
        }

        // If uuid was specified, but not the code.
        const user = db.getKeyByValue(atob(request.query["uuid"]));
        if (user) {
            response.sendFile("/views/discordLinking/clone.html", {root: "."});
            return;
        }

        if (!Data.discordLink) Data.discordLink = {};
        Data.discordLink[request.sessionID] = request.query["uuid"];
        response.redirect(Config.discordAPI.oauth2 + "authorize?client_id=579759958556672011&redirect_uri=" + encodeURI(Config.host + "link") + "&response_type=code&scope=identify");
        return;
    }

    // If the code was found.
    // Safeguard.
    if (!Data.discordLink) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }
    const uuid = Data.discordLink[request.sessionID];
    if (!uuid) {
        request.session.destroy();
        response.sendFile("/views/discordLinking/invalid.html", {root: "."});
        return;
    }

    request.session.destroy();
    const user = await Util.discordAPI(request.query.code, Config.host + "link", Config.discordAPI.users);
    if (user && !user.error) {
        // Save user.
        db[user.id] = atob(uuid);
        await Keyv.set("minecraft", db);
        response.sendFile("/views/discordLinking/linked.html", {root: "."});
    }
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};

const Util = require("../Util");
const Config = require("../Config");

module.exports = async (request, response) => {
    if (!request.query.code) {
        response.sendFile("/views/redirect-support.html", {root: "."});
        return;
    }
    const user = await Util.discordAPI(request.query.code, Config.host + "support", Config.discordAPI.users);
    if (user) response.redirect(Config.forms.supportticket + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};

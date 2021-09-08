const Util = require("../Util");
const Config = require("../Config");

module.exports = async (request, response) => {
    if (!request.query.code) {
        response.sendFile("/views/redirect-staffapp.html", {root: "."});
        return;
    }
    const user = await Util.discordAPI(request.query.code, Config.host + "apply", Config.discordAPI.users);
    console.log(user);
    if (user) response.redirect(Config.forms.staffapp + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};

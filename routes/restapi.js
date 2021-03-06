const {Keyv} = require("../Client");
const constanceBot = require("../ConstanceBotManager");

module.exports = async (request, response) => {
    for (const [key, value] of Object.entries(request.query)) {
        switch (key) {
            case "getWebhook":
                response.send(process.env.WEBHOOK_REDIRECT);
                break;
            case "getMCUser":
                if (value) {
                    let db = await Keyv.get("minecraft") || {};
                    response.send(db[value] || "");
                }
                else response.end();
                break;
            case "getMCUserID":
                let db = await Keyv.get("minecraft") || {};
                response.send(value ? db.getKeyByValue(value) : "");
                break;
            case "getMCUsers":
                response.send(await Keyv.get("minecraft") || {});
                break;
            case "getMemberTraffic":
                response.send(await Keyv.get("memberTraffic") || {});
                break;
            case "getEnv":
                if (value === process.env.ENV_PASSWORD) return response.sendFile("downloadedEnv.txt", {root: "."});
                response.status(500);
                response.send("No");
                break;
            case "stopConstance":
                if (value === process.env.ENV_PASSWORD) {
                    response.end();
                    await constanceBot.stop();
                    return;
                }
                response.status(500);
                response.send("No");
                break;
            case "startConstance":
                if (value === process.env.ENV_PASSWORD) {
                    response.end();
                    await constanceBot.restart();
                    return;
                }
                response.status(500);
                response.send("No");
                break;
        }
    }
};

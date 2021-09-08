const {Keyv} = require("../Client");

module.exports = async (request, response) => {
    for (let [key, value] of Object.entries(request.query)) {
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
        }
    }
};

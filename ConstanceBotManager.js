const Util = require("./Util");
const Config = require("./Config");
const {panelAPI} = require("./Client");

const id = {id: Config.multicraft.id};

module.exports = {
    async handleLogLater() {
        setTimeout(async () => {
            // Get latest log.
            const result = await panelAPI.getServerLog(id);
            const oldLogArray = result.data.reverse();
            let log = [];
            for (const obj of oldLogArray) {
                log.push(obj.line.replace(/\d+\.\d+\s\d+:\d+:\d+\s\[\w+]\s/g, ""));
                if (obj.line.includes("Starting server!")) break;
            }
            log = log.reverse().join("\n");

            if (log.includes("Startup Reafy!")) return;
            if (log.includes("Server stopped")) return await Util.sendErrorWebhook("Server stopped", log);
            await this.handleLogLater();
        }, 10 * 1000);
    },
    async restart() {
        await panelAPI.restartServer(id);
        await this.handleLogLater();
    },
    async stop() {
        await panelAPI.stopServer(id);
    }
};

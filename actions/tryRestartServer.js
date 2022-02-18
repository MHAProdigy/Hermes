const Config = require("../Config");
const {panelAPI} = require("../Client");

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

            // Started
            if (log.contains("Startup Reafy!") || log.contains("Server stopped")) return;
            await this.handleLogLater();
        }, 10 * 1000);
    },
    async restart() {
        await panelAPI.restartServer(id);
        await this.handleLogLater();
    }
};

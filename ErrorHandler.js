const Util = require("./Util");

async function handle(error, code = 0) {
    setTimeout(() => process.exit(code), 1000);

    // Send msg to webhook log.
    if (!(error instanceof Error)) return;
    await Util.sendErrorWebhook(error.message, ">>> " + error.stack);
}

process.on("uncaughtException", error => handle(error, 1));
process.on("unhandledRejection", error => handle(error,1));
process.on("SIGTERM", handle);
process.on("SIGINT", handle);

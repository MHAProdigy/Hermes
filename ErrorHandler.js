const fetch = require("node-fetch");

async function handle(error, code = 0) {
    setTimeout(() => process.exit(code), 1000);

    // Send msg to webhook log.
    if (!(error instanceof Error)) return;
    await fetch(process.env.ERROR_WEBHOOK, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({embeds: [{
                color: 0xff0000,
                title: error.message,
                description: ">>> " + error.stack,
                timestamp: Date.now()
            }]
        })
    });
}

process.on("uncaughtException", error => handle(error, 1));
process.on("unhandledRejection", error => handle(error,1));
process.on("SIGTERM", handle);
process.on("SIGINT", handle);

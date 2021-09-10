const nodemon = require("nodemon");

function launch() {
    nodemon({script: "Client.js"}).on("start", () => {
        console.log("Nodemon started.");
    }).on("crash", () => {
        console.log("Wizard crashed (again)");
        launch();
    });
}
launch();

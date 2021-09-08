const btoa = require("btoa");
const fetch = require("node-fetch");
const FormData = require("form-data");

const Config = require("./Config");

module.exports = {
    async discordAPI(code, redirect, request) {
        const creds = "Basic " + btoa(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET);
        const form = new FormData();
        form.append("client_id", process.env.CLIENT_ID);
        form.append("client_secret", process.env.CLIENT_SECRET);
        form.append("grant_type", "authorization_code");
        form.append("code", code);
        form.append("redirect_uri", encodeURI(redirect));
        form.append("scope", "identify");
        const response = await fetch(Config.discordAPI.oauth2 + "token", {
            method: "POST",
            body: form,
            headers: {Authorization: creds}
        }).then(y => y.json());
        return await fetch(request, {headers: {Authorization: "Bearer " + response["access_token"]}}).then(y => y.json());
    }
};

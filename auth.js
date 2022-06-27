// const https = require("https");
const utils = require(__dirname + '/util.js');
const env = require('dotenv').config();
// const ejs = require('ejs');

var output = "";
module.exports.userData = userData;
var userData;


function b64EncodedToken() {
    const tokens = "" + env.parsed.SSO_CLIENT_ID + ":" + env.parsed.SSO_SECRET_KEY;
    const buf = Buffer.from(tokens);
    const b64EncodedTokens = "Basic " + buf.toString('base64');
    return b64EncodedTokens;
}

async function getPublicData(token, res) {
    console.log("DEBUG: getPublicData()");
    const auth_string = "Bearer " + token;
    var options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/oauth/verify',
        method: 'GET',
        headers: {
            'Authorization': auth_string,
        }
    };
    var character = await utils.htmlRequest(options, "");

    console.log("character = ", character);


    var path = "/latest/characters/" + character.CharacterID + "/";
    options = {
        hostname: 'esi.evetech.net',
        port: 443,
        path: path,
        method: 'GET',
    };

    var payload = "";

    var pubData = await utils.htmlRequest(options, payload);
    // var pubData = await getCharacterPubInfo(character.CharacterID);
    // console.log("Character = ", character);
    console.log("pubData = ", pubData);
    res.render("home", { character: character });
}

module.exports.loginWithToken = loginWithToken;
async function loginWithToken(refresh_token) {
    if (refresh_token == "") refresh_token = env.parsed.REFRESH_TOKEN_MIWS;
    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/v2/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': b64EncodedToken(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
    };

    var payload = "grant_type=refresh_token&refresh_token=" + refresh_token;

    var res = await utils.htmlRequest(options, payload);
    // var response = await loginRefreshToken("vDGckDeca0ScBVgrg9V8aA==");
    // console.log("res = ", res);
}

module.exports.startSSO = startSSO;
async function startSSO(code, state, res) {
    console.log("DEBUG: startSSO():");
    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/v2/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': b64EncodedToken(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
    };

    var payload = "grant_type=authorization_code&code=" + code;
    var response = await utils.htmlRequest(options, payload);
    // var response = await getAccessToken(code);
    // console.log("response = ", response);
    getPublicData(response.access_token, res);
}

module.exports.authenticate = authenticate;
async function authenticate(strategy) {
    // console.log("DEBUG: authenticate():");
    await passport.authenticate(strategy);
}
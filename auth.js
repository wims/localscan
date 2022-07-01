const { ExplainVerbosity } = require('mongodb');

// const https = require("https");
const utils = require(__dirname + '/util.js');
// const redis = require(__dirname + '/redis.js');
const mongo = require(__dirname + '/mongo.js');
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

function b64Encode(part_1, part_2) {
    const tokens = "" + part_1 + ":" + part_2;
    const buf = Buffer.from(tokens);
    const b64EncodedTokens = buf.toString('base64');
    return b64EncodedTokens;
}

async function getPublicData(tokenObject, res) {
    console.log("DEBUG: getPublicData()");
    const auth_string = "Bearer " + tokenObject.access_token;
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

    var path = "/latest/characters/" + character.CharacterID + "/";
    options = {
        hostname: 'esi.evetech.net',
        port: 443,
        path: path,
        method: 'GET',
    };

    var payload = "";

    var pubData = await utils.htmlRequest(options, payload);
    character.corporation_id = pubData.corporation_id;
    character.alliance_id = pubData.alliance_id;
    character.refresh_token = tokenObject.refresh_token;
    // var pubData = await getCharacterPubInfo(character.CharacterID);
    console.log("Character = ", character);
    console.log("pubData = ", pubData);
    // res.cookie('localscan_id', b64Encode(character.CharacterID, character.CharacterOwnerHash));

    res.cookie('localscan_id', character.CharacterOwnerHash);
    console.log("Wrote cookie");

    mongo.insertRecord(character);
    // redis.saveUser(character);

    res.render("home", { character: character });
}

module.exports.loginWithToken = loginWithToken;
async function loginWithToken(char_id, res) {
    console.log("DEBUG: loginWithToken()");
    // var char = await mongo.getCharacterInfo(char_id);
    var char = await mongo.getChar(char_id);
    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/v2/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': b64EncodedToken(),
            // 'Authorization': 'Basic YzQ1ZTQ4YWZjMzZhNDhjNmI2NzQzMTUzMDUxZTc2OGM6Z1pEZ3VlcFRUbWUxYmx1a291VlNvOE44ZEFQRm9XM2NwU0hWWmFrQw==',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
    };

    var payload = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(char[0].refresh_token);

    var result = await utils.htmlRequest(options, payload);
    console.log("result=", result);
    res.render("home", { character: char[0] });
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
    getPublicData(response, res);
}

module.exports.authenticate = authenticate;
async function authenticate(strategy) {
    // console.log("DEBUG: authenticate():");
    await passport.authenticate(strategy);
}
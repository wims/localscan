const https = require("https");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const utils = require(__dirname + '/util.js');
const localscan = require(__dirname + "/localscan.js");
const dscan = require(__dirname + "/dscan.js");
const auth = require(__dirname + "/auth.js");
// const redis = require(__dirname + "/redis.js");
const mongo = require(__dirname + "/mongo.js");

const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongo.connect();



app.get("/", function (req, res) {
    res.render("home");
});

app.get("/sso-callback", function (req, res) {
    const code = req.query.code;
    const state = req.query.state;

    auth.startSSO(code, state, res);
});

app.get("/signon", function (req, res) {
    if (req.cookies.localscan_id) {
        console.log("Cookie = ", req.cookies.localscan_id);
        auth.loginWithToken(req.cookies.localscan_id, res);
    } else {
        res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=publicData%20esi-alliances.read_contacts.v1%20esi-characters.read_contacts.v1%20esi-corporations.read_contacts.v1&state=logon');
    }
});

app.get("/token_signon", function (req, res) {
    auth.loginWithToken("", res);
});

app.post("/", function (req, res) {
    if (utils.isDscan(req.body.paste)) {
        console.log('Found dscan');
        dscan.getScanSummary(utils.parseScan(req.body.paste, res));
    } else {
        var scan = localscan.getLocalScanSummary(req.body.paste, req.cookies.localscan_id, res);
        console.log('Found localscan');
    }
});


app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
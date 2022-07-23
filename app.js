const https = require("https");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const ejs = require('ejs');
const cookieParser = require('cookie-parser')

const utils = require(__dirname + '/util.js');
const localscan = require(__dirname + "/localscan.js")
const dscan = require(__dirname + "/dscan.js");
const auth = require(__dirname + "/auth.js");
// const redis = require(__dirname + "/redis.js");
const mongo = require(__dirname + "/mongo.js");

const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongo.connect();

app.get("/", function (request, response) {
    response.render("home");
});

app.get("/request", function (req, res) {
    redis.connect();
    res.render("home");
});

// app.get("/sso-callback", passport.authenticate('eveonline', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }));

app.get("/mondb", function (req, res) {
    mongo.insertRecord('swm');
    mongo.getRecord('swm');
});

app.get("/monfind", function (req, res) {
    mongo.getRecord('swm');
    // mongo.disconnect();
});

app.get("/sso-callback", function (req, res) {
    // console.log("ip = ", req.socket.remoteAddress);
    // console.log("query = ", req.query);
    // console.log("res = ", res);
    const code = req.query.code;
    const state = req.query.state;

    auth.startSSO(code, state, res);
    // console.log("Welcome, ", auth.userData);
    // res.render("home");
});

app.get("/signon", function (req, res) {
    // res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=esi-characters.read_contacts.v1%20esi-corporations.read_contacts.v1%20esi-alliances.read_contacts.v1&state=wims5');
    if (req.cookies.localscan_id) {
        console.log("Cookie = ", req.cookies.localscan_id);
        // auth.loginWithToken(req.cookies.localscan_id);
        auth.loginWithToken(req.cookies.localscan_id, res);
    } else {
        res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=publicData%20esi-alliances.read_contacts.v1%20esi-characters.read_contacts.v1%20esi-corporations.read_contacts.v1&state=logon');
    }
    // auth.authenticate('eveonline');
});

app.get("/token_signon", function (req, res) {
    auth.loginWithToken("", res);
    // auth.loginWithToken("");
});

app.get("/charinfo", async function (req, res) {
    // var cookie = req.cookies.localscan;
    // try {
    //     var cookie = "TK62T4bQEzPT5cqQb0MVSzVkJOk=";
    //     console.log("cookie = ", cookie);
    //     var char = await mongo.getCharInfo(cookie);
    //     console.log("char = ", char);
    // } catch (error) {
    //     console.log("Error!", error);
    // }
    // mongo.connect();
    mongo.getChar("TK62T4bQEzPT5cqQb0MVSzVkJOk=");
});

app.get("/contacts", function(req, res) {
    localscan.getContacts(req.cookies.localscan_id, res);
});

app.post("/", function (req, res) {
    if (utils.isDscan(req.body.paste)) {
        console.log('Found dscan');
        dscan.getScanSummary(utils.parseScan(req.body.paste));
    } else {
        localscan.getLocalScanSummary(req.body.paste);
        console.log('Found localscan');
    }

    res.render("home");
});


app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
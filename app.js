const https = require("https");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const ejs = require('ejs');


const utils = require(__dirname + '/util.js');
const localscan = require(__dirname + "/localscan.js")
const dscan = require(__dirname + "/dscan.js");
const auth = require(__dirname + "/auth.js");
const redis = require(__dirname + "/redis.js");

const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));



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


app.get("/sso-callback", function (req, res) {
    console.log("res = ", req.query);
    const code = req.query.code;
    const state = req.query.state;

    auth.startSSO(code, state, res);
    // console.log("Welcome, ", auth.userData);
    // res.sendFile("home");
});

app.get("/signon", function (req, res) {
    // res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=esi-characters.read_contacts.v1%20esi-corporations.read_contacts.v1%20esi-alliances.read_contacts.v1&state=wims5');
    res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=publicData&state=logon');
    auth.authenticate('eveonline');
});

app.post("/", function (req, res) {
    const scanData = utils.parseScan(req.body.paste);
    if (utils.isDscan(req.body.paste)) {
        dscan.getScanSummary(scanData);
    } else {
        localscan.getLocalScanSummary(req.body.paste);
    }

    res.render("home");
});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
const https = require("https");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const utils = require(__dirname + '/util.js');
const localscan = require(__dirname + "/localscan.js")
const dscan = require(__dirname + "/dscan.js");
const auth = require(__dirname + "/auth.js");
const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=esi-characters.read_contacts.v1&state=wims1




app.get("/", function (request, response) {
    response.sendFile(__dirname + "/post.html");
});

app.get("/request", function (req, res) {
    getLocalScanSummary();
    res.sendFile(__dirname + "/post.html");
});

// app.get("/sso-callback", passport.authenticate('eveonline', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }));


app.get("/sso-callback", function (req, res) {
    console.log("res = ", req.query);
    const code = req.query.code;

    auth.startSSO(code);
    res.sendFile(__dirname + "/post.html");
});

app.get("/signon", function (req, res) {
    res.redirect('https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=http://127.0.0.1:3000/sso-callback/&client_id=c45e48afc36a48c6b6743153051e768c&scope=esi-characters.read_contacts.v1&state=wims5');
    auth.authenticate('eveonline');
    // console.log("req = ", req);
    // console.log("res = ", res);
    res.sendFile(__dirname + "/post.html");
});

app.post("/", function (req, res) {
    const scanData = utils.parseScan(req.body.paste);
    if (utils.isDscan(req.body.paste)) {
        dscan.getScanSummary(scanData);
    } else {
        localscan.getLocalScanSummary(req.body.paste);
    }

    res.sendFile(__dirname + "/post.html");
});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
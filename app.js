const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const utils = require(__dirname + '/util.js');
const localscan = require(__dirname + "/localscan.js")
const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));




app.get("/", function (request, response) {
    response.sendFile(__dirname + "/post.html");
});

app.get("/request", function (req, res) {
    getLocalScanSummary();
    res.sendFile(__dirname + "/post.html");
});

app.post("/", function (req, res) {
    const scanData = utils.parseScan(req.body.paste);

    localscan.getLocalScanSummary(req.body.paste);
    // getScanSummary(scanData);

    res.sendFile(__dirname + "/post.html");
});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
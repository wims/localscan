const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const https = require("https");
const tls = require('node:tls');

const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

var shiptype = "";
var countedShips = {};
var userIdList = {};
var countedClasses = new Map();
const shipClasses = new Map();
const shipNames = new Map();


function generatePostData(scanData) {
    var ret = '["';
    var temp = "";
    for (var i = 0; i < scanData.length; i++) {
        if (scanData[i] != "\n") {
            temp = temp + scanData[i];
        } else {
            ret = ret + temp.substring(0, temp.length - 1) + '", "';
            temp = "";
        }
    }

    ret = ret + temp + '"]';

    console.log("ret = ", ret);
    return ret;
}

function runRequest(scanData) {
    // var postData = "[\"miws vokan\" , \"Gumzy Krango\"]";
    var postData = generatePostData(scanData);

    const options = {
        hostname: 'esi.evetech.net',
        port: 443,
        path: '/latest/universe/ids/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
        }
    };
    options.agent = new https.Agent(options);

    return new Promise((resolve, reject) => {
        console.log("ScanData = ", scanData);

        var data = "";
        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                data = data + d;
            });

            res.on('error', (e) => {
                console.error(e.message);
            });

            res.on('end', () => {
                resolve(userIdList = JSON.parse(data));
            })
        });

        req.on('error', (e) => {
            console.error(e.message);
        });

        req.write(postData);

        req.end();
    });
}

async function getLocalScanSummary(scanData) {
    // shiptype = await getShipType(dataLine['id']);
    var req = await runRequest(scanData);
    writeUserIds();
}

function writeUserIds() {
    console.log("writeUserIds():");
    console.log("userIdList = ", userIdList);
}

// Parses scan data from the webform
function parseScan(data) {
    countedShips = {};
    const splitLines = str => str.split(/\r?\n/);
    const dataArray = splitLines(data);

    const returnData = [];

    for (let i = 0; i < dataArray.length; i++) {
        const shipArray = dataArray[i].split("    ");
        const ship = {
            "id": shipArray[0],
            "textname": shipArray[1],
            "name": shipArray[2],
            "distance": shipArray[3],
        }
        returnData.push(ship);
        shipNames.set(shipArray[0], ship['name']);
    }

    return returnData;
}

function getShipType(id) {
    return new Promise((resolve, reject) => {
        var endpoint = "https://esi.evetech.net/latest/universe/types/" + id + "/?datasource=tranquility&language=en";


        https.get(endpoint, function (response) {
            let dataVal = "";
            var parsed = "";
            var group_id = "";

            // console.log(response.statusCode);

            // concatenate received data
            response.on("data", function (data) {
                dataVal = dataVal + data;
            });

            // when all data have been received, run this
            response.on("end", function () {

                parsed = JSON.parse(dataVal);
                group_id = parsed['group_id'];

                endpoint = "https://esi.evetech.net/latest/universe/groups/" + group_id + "/?datasource=tranquility&language=en";

                https.get()
                https.get(endpoint, function (response) {
                    dataVal = "";
                    response.on("data", function (data) {
                        dataVal = dataVal + data;
                    });

                    response.on("end", function () {
                        parsed = JSON.parse(dataVal);
                        // console.log("name = " + parsed['name']);
                        shiptype = parsed['name'];
                        shipClasses.set(id, shiptype);
                        resolve(shiptype = parsed['name']);
                    });
                });

            });
        });
    });
}

async function getScanSummary(scanData) {
    for (let i = 0; i < scanData.length; i++) {
        dataLine = scanData[i];

        if (dataLine['id'] in countedShips) {
            countedShips[dataLine['id']] = countedShips[dataLine['id']] + 1;
        } else {
            countedShips[dataLine['id']] = 1;
        }

        if (shipClasses.has(dataLine['id'])) {
            shiptype = shipClasses.get(dataLine['id']);
        } else {
            shiptype = await getShipType(dataLine['id']);
        }
    }
    writeSummary();

    // return countedShips;
}

function sumClasses() {
    for (const key in countedShips) {
        var count = 0;
        var shipClass = shipClasses.get(key);

        if (countedClasses.has(shipClass)) {
            count = countedClasses.get(shipClass);
        }
        count += countedShips[key];

        countedClasses.set(shipClass, count);
    }
}

function writeSummary() {
    sumClasses();

    for (const key in countedShips) {
        console.log("ship_id = ", key, " count = ", countedShips[key], "name = ", shipNames.get(key), "class = ", shipClasses.get(key));
    }
    console.log("-----------------");

    for (const key of countedClasses.keys()) {
        console.log("class id = ", key, "count = ", countedClasses.get(key));
    }
}


app.get("/", function (request, response) {
    response.sendFile(__dirname + "/post.html");
});

app.get("/request", function (req, res) {
    getLocalScanSummary();
    res.sendFile(__dirname + "/post.html");
});

app.post("/", function (req, res) {
    const scanData = parseScan(req.body.paste);

    getLocalScanSummary(req.body.paste);
    // getScanSummary(scanData);

    res.sendFile(__dirname + "/post.html");
});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
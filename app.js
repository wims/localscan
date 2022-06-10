const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const https = require("https");
const { waitForDebugger } = require("inspector");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

var shiptype = "";
var countedShips = {};
var countedClasses = new Map();
const shipClasses = new Map();
const shipNames = new Map();

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
        console.log("i = " + i);
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

        console.log("Ship type = " + shiptype);
    }
    //console.log(countedShips);
    console.log("End for loop");

    console.log("Counted data: ", countedShips);
    console.log("Ship classes: ", shipClasses);
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
        console.log("shipClass = ", shipClass, "  count = ", count);
    }
}

function writeSummary() {
    sumClasses();
    for (const key in countedShips) {
        console.log("ship_id = ", key, " count = ", countedShips[key], "name = ", shipNames.get(key), "class = ", shipClasses.get(key));
    }

    console.log("-----------------");

    for (const key of countedClasses.keys()) {
        // problemet er at shipClasses forventer en id, ikke ett klassenavn
        console.log("class id = ", key, "count = ", countedClasses.get(key));
    }
}


app.get("/", function (request, response) {
    response.sendFile(__dirname + "/post.html");
});

app.post("/", function (req, res) {
    var paste = req.body.paste;
    // testJsonParser();
    const scanData = parseScan(paste);
    console.log(scanData);

    getScanSummary(scanData);
    console.log("Finished getScanSummary");

    // console.log("Scan summary = " + scanSummary);


    res.sendFile(__dirname + "/post.html");

});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
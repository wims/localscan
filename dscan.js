const https = require("https");
const tls = require('node:tls');

var shiptype = "";
var countedShips = {};
var countedClasses = new Map();
const shipClasses = new Map();
const shipNames = new Map();

module.exports.getScanSummary = getScanSummary;
async function getScanSummary(scanData) {
    // console.log("getScanSummary():");
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


function getShipType(id) {
    // console.log("getShipType():");
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
                // console.log("Getting data...");
            });

            // when all data have been received, run this
            response.on("end", function () {
                // console.log("end");

                parsed = JSON.parse(dataVal);
                group_id = parsed['group_id'];

                endpoint = "https://esi.evetech.net/latest/universe/groups/" + group_id + "/?datasource=tranquility&language=en";

                https.get(endpoint, function (response) {
                    dataVal = "";
                    response.on("data", function (data) {
                        // console.log("Getting data again");
                        dataVal = dataVal + data;
                    });

                    response.on("end", function () {
                        // console.log("Ending again");
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

function sumClasses() {
    // console.log("sumClasses():");
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
    // console.log("writeSummary():");
    sumClasses();

    for (const key in countedShips) {
        console.log("ship_id = ", key, " count = ", countedShips[key], "name = ", shipNames.get(key), "class = ", shipClasses.get(key));
    }
    console.log("-----------------");

    for (const key of countedClasses.keys()) {
        console.log("class id = ", key, "count = ", countedClasses.get(key));
    }
}
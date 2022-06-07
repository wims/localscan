const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const https = require("https");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));




function parseScan(data) {
    const splitLines = str => str.split(/\r?\n/);
    const dataArray = splitLines(data);
    const returnArray = [];

    for (let i = 0; i < dataArray.length; i++) {
        const shipArray = dataArray[i].split("    ");
        const shipData = {
            "id": shipArray[0],
            "textname": shipArray[1],
            "name": shipArray[2],
            "distance": shipArray[3]
        }

        returnArray.push(shipData);
    }

    return returnArray;
}

function getShipType(id) {
    const endpoint = "https://esi.evetech.net/latest/universe/types/" + id + "/?datasource=tranquility&language=en";
    https.get(endpoint, function (response) {
        console.log(response.statusCode);
        response.on("data", function (data) {
            console.log(JSON.parse(data));
        });
    });

    console.log("Endpoint = " + endpoint);
}

function getScanSummary(data) {
    var countedData = {};

    for (let i = 0; i < data.length; i++) {
        dataLine = data[i];

        if (dataLine['id'] in countedData) {
            countedData[dataLine['id']] = countedData[dataLine['id']] + 1;
            getShipType(dataLine['id']);
        } else {
            countedData[dataLine['id']] = 1;
        }
    }

    console.log(countedData);


    return countedData;
}



app.get("/", function (request, response) {
    response.sendFile(__dirname + "/post.html");
});

app.post("/", function (req, res) {
    var paste = req.body.paste;
    const scanData = parseScan(paste);
    // console.log(scanData);

    const scanSummary = getScanSummary(scanData);

    res.sendFile(__dirname + "/post.html");

});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
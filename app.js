const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));




function parseScan(data) {
    // console.log(data);
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

        // console.log(shipData);
        // console.log(dataArray[i]);
    }

    return returnArray;

    // console.log(dataArray);
}

function getScanSummary(data) {
    var countedData = {};

    for (let i = 0; i < data.length; i++) {
        dataLine = data[i];
        console.log(dataLine);

        console.log("dataline[id] = " + dataLine['id'])
        if (dataLine['id'] in countedData) {
            countedData[dataLine['id']] = countedData[dataLine['id']] + 1;
        } else {
            countedData[dataLine['id']] = 1;
        }
    }

    console.log(countedData);
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
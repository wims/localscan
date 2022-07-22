const https = require("https");


module.exports.isDscan = isDscan;
function isDscan(data) {
    const splitLines = str => str.split(/\r?\n/);
    const dataArray = splitLines(data);
    // const scanArray = dataArray[i].split("    ");
    const scanArray = dataArray[0].split("\t");
    console.log("Scanarray length = ", scanArray.length);
    console.log("Scanarray:", scanArray);
    if (scanArray.length == 4) return true;
    else return false;
}

module.exports.parseScan = parseScan;
// Parses scan data from the webform
function parseScan(data) {
    // 12005    Cosmic Anomaly    Ishtar    -
    console.log("DEBUG: util.parseScan():");
    countedShips = {};
    const splitLines = str => str.split(/\r?\n/);
    const dataArray = splitLines(data);

    const returnData = [];
    
    console.log("dataArray =", dataArray);

    for (let i = 0; i < dataArray.length; i++) {
        // const shipArray = dataArray[i].split("    ");
        const shipArray = dataArray[i].split("\t");
        console.log("shipArray = ", shipArray);
        const ship = {
            "id": shipArray[0],
            "textname": shipArray[1],
            "name": shipArray[2],
            "distance": shipArray[3],
        }
        console.log("ship =", ship);
        returnData.push(ship);
        // shipNames.set(shipArray[0], ship['name']);
    }

    return returnData;
}

module.exports.htmlRequest = htmlRequest;
function htmlRequest(options, payload) {
    options.agent = new https.Agent(options);

    return new Promise((resolve, reject) => {
        var data = "";
        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                data = data + d;
                // console.log(d);
            });

            res.on('error', (e) => {
                console.log("ERROR!");
                console.error(e.message);
            });

            res.on('end', () => {
                resolve(output = JSON.parse(data));
            });
        });

        req.on('error', (e) => {
            console.log("Outer error!");
            console.error(e.message);
        });

        if (payload != "") req.write(payload);

        req.end();
    });
}
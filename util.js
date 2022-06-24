const https = require("https");


module.exports.isDscan = isDscan;
function isDscan(data) {
    const splitLines = str => str.split(/\r?\n/);
    const dataArray = splitLines(data);
    const scanArray = dataArray[0].split("    ");
    if (scanArray.length == 4) return true;
    else return false;
}

module.exports.parseScan = parseScan;
// Parses scan data from the webform
function parseScan(data) {
    // 12005    Cosmic Anomaly    Ishtar    -
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
            })
        });

        req.on('error', (e) => {
            console.log("Outer error!");
            console.error(e.message);
        });

        if (payload != "") req.write(payload);

        req.end();
    });
}
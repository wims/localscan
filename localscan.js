const https = require("https");

var userIdList = {};

module.exports.generatePostData = generatePostData;
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
        var data = "";
        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                data = data + d;
            });

            res.on('error', (e) => {
                console.log("Error!");
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

module.exports.getLocalScanSummary = getLocalScanSummary;
async function getLocalScanSummary(scanData) {
    // shiptype = await getShipType(dataLine['id']);
    var req = await runRequest(scanData);
    writeUserIds();
}

function getStandingsList() {

}

function writeUserIds() {
    console.log("writeUserIds():");
    console.log("userIdList = ", userIdList);
}
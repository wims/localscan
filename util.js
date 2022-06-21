module.exports.parseScan = parseScan;

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
        // shipNames.set(shipArray[0], ship['name']);
    }

    return returnData;
}
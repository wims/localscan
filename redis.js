const redis = require('redis');
const client = redis.createClient();

module.exports.connect = connect;
async function connect() {
    console.log("Trying to connect to database...");
    await client.connect();
    console.log("Connected to database!");
}

module.exports.disconnect = disconnect;
async function disconnect() {
    console.log("Trying to disconnect from database...");
    await client.disconnect();
    console.log("Disconnected from database!");
}

module.exports.saveUser = saveUser;
async function saveUser(character) {
    connect();

}
var mongoose = require('mongoose');

var mongoDB = 'mongodb://127.0.0.1/localscan';
var Schema = mongoose.Schema;
var characterModelSchema = new Schema({
    characterName: String,
    dateJoined: Date
});
var CharacterModel = mongoose.model('CharacterModel', characterModelSchema);


module.exports.createDB = createDB;
async function createDB() {
    await create();
}
function create() {
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

    //Get the default connection
    var db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('connected', console.error.bind(console, 'Mongodb connected!'));
    db.on('disconnected', console.error.bind(console, 'Mongodb disconnected :('));
}

module.exports.insertRecord = insertRecord;
function insertRecord(characterName) {
    var characterInstance = new CharacterModel({ characterName: characterName, dateJoined: new Date() });
    // Save the new model instance, passing a callback
    characterInstance.save(function (err) {
        if (err) return handleError(err);
        console.log('Character ' + characterName + " inserted into db!");
        // saved!
    });
}

module.exports.getRecord = getRecord;
async function getRecord(characterName) {
    await record(characterName);
}
function record(characterName) {
    CharacterModel.find({ characterName: characterName }, 'characterName dateJoined', function (err, time) {
        if (err) console.log("Error! ", err);
        console.log("The character record was created at ", time);
    });
}

module.exports.disconnect = disconnect;
async function disconnect() {
    await dc();
}
function dc() {
    mongoose.disconnect(function (err) {
        if (err) console.log("Error! ", err);
        console.log("Disconnected from mongo");
    });
}
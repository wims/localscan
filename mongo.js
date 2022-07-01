const { ExplainVerbosity } = require('mongodb');
var mongoose = require('mongoose');
const { useCallback } = require('react');

var mongoDB = 'mongodb://127.0.0.1/localscan';
var Schema = mongoose.Schema;
var characterModelSchema = new Schema({
    characterID: Number,
    characterName: String,
    scopes: String,
    characterOwnerHash: String,
    corporationID: Number,
    allianceID: Number,
    refresh_token: String
});
var CharacterModel = mongoose.model('CharacterModel', characterModelSchema);
mongoose.set('debug', { shell: true })

module.exports.connect = createDB;
function createDB() {
    create();
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
function insertRecord(characterObject) {
    console.log("characterObject = ", characterObject);
    var characterInstance = new CharacterModel({
        characterID: characterObject.CharacterID,
        characterName: characterObject.CharacterName,
        scopes: characterObject.Scopes,
        characterOwnerHash: characterObject.CharacterOwnerHash,
        corporationID: characterObject.corporation_id,
        allianceID: characterObject.alliance_id,
        refresh_token: characterObject.refresh_token
    });

    // var charInstance = new CharacterModel(characterObject);
    // Save the new model instance, passing a callback
    characterInstance.save(function (err) {
        if (err) {
            console.log("Error inserting", err);
            exit();
        }
        console.log('Character ' + characterObject + " inserted into db!");
        // saved!
    });
}

module.exports.getChar = getChar;
async function getChar(characterOwnerHash) {
    console.log("DEBUG: getChar()");
    var char = await CharacterModel.find({ characterOwnerHash: characterOwnerHash }).exec();
    // console.log("char =", char);
    return char;
}

// module.exports.getCharacterInfo = getCharacterInfo;
// async function getCharacterInfo(char_id) {
//     console.log("DEBUG: getCharacterInfo()");
//     char = await getCharInfo(char_id);
//     console.log("char = ", char);
//     console.log("DEBUG: Returning from getCharacterInfo()");
//     resolve(char);
//     // return char;
// }
// module.exports.getCharInfo = getCharInfo;
// function getCharInfo(char_id) {
//     console.log("DEBUG: getCharInfo()");
//     return new Promise((resolve, reject) => {
//         // CharacterModel.find({ characterOwnerHash: char_id }).exec();
//         CharacterModel.find({ characterOwnerHash: char_id }, function (err, character) {
//             console.log("In callback");
//             if (err) {
//                 console.log("Error trying to find character ", err);
//                 reject(error);
//             }
//             resolve(character);
//             console.log("Character found! ", character);
//         });
//     });
// }

module.exports.getRecord = getRecord;
function getRecord(characterName) {
    console.log("DEBUG: getRecord()");
    return record(characterName);
}
function record(characterName) {
    console.log("DEBUG: record()");
    return CharacterModel.find({ characterName: characterName }, 'characterName dateJoined', function (err, time) {
        if (err) console.log("Error! ", err);
        console.log("The character record was created at ", time);
        return time;
    });
}

module.exports.disconnect = disconnect;
function disconnect() {
    dc();
}
function dc() {
    mongoose.disconnect(function (err) {
        if (err) console.log("Error! ", err);
        console.log("Disconnected from mongo");
    });
}
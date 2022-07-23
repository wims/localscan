const https = require("https");
const { ExplainVerbosity } = require('mongodb');
const mongo = require(__dirname + '/mongo.js');
const utils = require(__dirname + '/util.js');
const auth = require(__dirname + '/auth.js');


var userIdList = {};
var characterList = new Map();

module.exports.generatePostData = generatePostData;
function generatePostData(scanData) {
    var postData = '["';
    var temp = "";
    for (var i = 0; i < scanData.length; i++) {
        if (scanData[i] != "\n") {
            temp = temp + scanData[i];
        } else {
            postData = postData + temp.substring(0, temp.length - 1) + '", "';
            temp = "";
        }
    }

    postData = postData + temp + '"]';

    return postData;
}

module.exports.getContacts = getContacts;
async function getContacts(char_id) {
    const accessToken = await auth.getNewAccessToken(char_id);
    var authString = "Bearer " + accessToken;
    var char = await mongo.getChar(char_id);

    var options = {
        hostname: 'esi.evetech.net',
        port: 443,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'authorization': authString,
            'Cache-Control': 'no-cache',
        }
    };

    var payloadAlliances = "/latest/alliances/" +  char[0].allianceID + "/contacts/";
    var payloadCorporations = "/latest/corporations/" +  char[0].corporationID + "/contacts/";
    var payloadPersonal = "/latest/characters/" + char[0].characterID + "/contacts/";
    
    
    options.path = payloadAlliances;
    var allianceContacts = await utils.htmlRequest(options, payloadAlliances);

    options.path = payloadCorporations
    var corporationsContacts = await utils.htmlRequest(options, payloadCorporations);

    options.path = payloadPersonal;
    var personalContacts = await utils.htmlRequest(options, payloadPersonal);

    var contactList = new Map();

    for (var contact of allianceContacts) {
        contactList.set(contact.contact_id, contact.standing);
    }
    for (var contact of corporationsContacts) {
        contactList.set(contact.contact_id, contact.standing);
    }
    for (var contact of personalContacts) {
        contactList.set(contact.contact_id, contact.standing);
    }

    // console.log("Contact list has " + contactList.size + " elements");

    return contactList;
    
    // res.render("home", { character: char[0] });
}

module.exports.getLocalScanSummary = getLocalScanSummary;
async function getLocalScanSummary(scanData, char_id, res) {
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

    req = await utils.htmlRequest(options, postData);

    for (var entry of req.characters) {
        var character = {};
        character.name = entry.name;
        characterList.set(entry.id, character);
    }

    postData = "[";
    for (var character of req.characters) {
        postData  = postData + character.id + ", ";
    }
    postData = postData.substring(0, postData.length - 2) + "]";

    options.path = '/latest/characters/affiliation/';
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
    };

    var affiliations = await utils.htmlRequest(options, postData);

    var contactList = await getContacts(char_id, res);
 
    for (var affiliation of affiliations) {
        var character = characterList.get(affiliation.character_id);

        var allianceStanding = contactList.get(affiliation.alliance_id);
        var corporationStanding = contactList.get(affiliation.corporation_id);
        var characterStanding = contactList.get(affiliation.character_id);
        
        if (allianceStanding != undefined) {
            character.allianceStanding = allianceStanding;
        }
        if (corporationStanding != undefined) {
            character.corporationStanding = corporationStanding;
        }
        if (characterStanding != undefined) {
            character.characterStanding = characterStanding;
        }

        
        postData = "[" + affiliation.alliance_id + ", " + affiliation.corporation_id + "]";
        postData = "[";
        if (affiliation.alliance_id != undefined) postData = postData + affiliation.alliance_id;
        if (postData != "[") postData = postData + ", ";
        if (affiliation.corporation_id != undefined) postData = postData + affiliation.corporation_id;
        postData = postData + "]";

        options.path = '/latest/universe/names/';
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
        };
        var groupnames = await utils.htmlRequest(options, postData);
        // console.log("postdata =", postData);
        // console.log("groupnames =", groupnames);
        for (var i = 0; i < groupnames.length; i++) {
            if (groupnames[i].category == 'alliance') character.alliance = groupnames[i].name;
            if (groupnames[i].category == 'corporation') character.corporation = groupnames[i].name;
        }

        characterList.set(affiliation.character_id, character);
    }

    writeUserIds();
}

function writeUserIds() {
    console.log("writeUserIds():");
    console.log("userIdList = ", characterList);
}

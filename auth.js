const https = require("https");
const env = require('dotenv').config();
const passport = require("passport");
const EveOnlineStrategy = require("passport-eveonline");
const ejs = require('ejs');

var output = "";
module.exports.userData = userData;
var userData;

passport.use(new EveOnlineStrategy({
    clientID: env.parsed.SSO_CLIENT_ID,
    secretKey: env.parsed.SSO_SECRET_KEY,
    callbackURL: "http://127.0.0.1:3000/sso-callback/"
},
    function (characterInformation, done) {
        console.log("In function");
        User.findOrCreate(
            { characterID: characterInformation.characterID },
            function (err, user) {
                console.log("user : ", user);
                return done(err, user);
            }
        );
    }
));

function getAccessToken(code) {
    // console.log("DEBUG: replyToSSO():");
    const tokens = "" + env.parsed.SSO_CLIENT_ID + ":" + env.parsed.SSO_SECRET_KEY;
    const buf = Buffer.from(tokens);
    const b64EncodedTokens = "Basic " + buf.toString('base64');

    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/v2/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': b64EncodedTokens,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
    };
    options.agent = new https.Agent(options);
    // var payload = new URLSearchParams({
    //     'grant_type': 'authorization_code',
    //     'code': code
    // });
    var payload = "grant_type=authorization_code&code=" + code;

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
                // console.log("Data length = ", data.length);
                // resolve(output = data);
                resolve(output = JSON.parse(data));
            })
        });

        req.on('error', (e) => {
            console.log("Outer error!");
            console.error(e.message);
        });

        req.write(payload);

        req.end();
    });
}

function runRequest(token) {
    console.log("DEBUG: runRequest()");
    // var postData = "[\"miws vokan\" , \"Gumzy Krango\"]";

    const auth_string = "Bearer " + token;
    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/oauth/verify',
        method: 'GET',
        headers: {
            'Authorization': auth_string,
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
                resolve(userData = JSON.parse(data));
                // console.log("userData = ", userData);
            })
        });

        req.on('error', (e) => {
            console.error(e.message);
        });

        // req.write(postData);

        req.end();
    });
}

async function getPublicData(token, res) {
    console.log("DEBUG: getPublicData()");
    var character = await runRequest(token);
    console.log("Character = ", character);
    res.render("home", { character: character });
}

module.exports.startSSO = startSSO;
async function startSSO(code, state, res) {
    console.log("DEBUG: startSSO():");
    var response = await getAccessToken(code);
    getPublicData(response.access_token, res);
}

module.exports.authenticate = authenticate;
async function authenticate(strategy) {
    // console.log("DEBUG: authenticate():");
    await passport.authenticate(strategy);
}
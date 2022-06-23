const https = require("https");
const env = require('dotenv').config();
const passport = require("passport");
const EveOnlineStrategy = require("passport-eveonline");

var output = "";


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

function replyToSSO(code) {
    console.log("DEBUG: replyToSSO():");
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
                console.log(d);
            });

            res.on('error', (e) => {
                console.log("ERROR!");
                console.error(e.message);
            });

            res.on('end', () => {
                console.log("Data length = ", data.length);
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

module.exports.startSSO = startSSO;
async function startSSO(code) {
    console.log("DEBUG: startSSO():");
    var response = await replyToSSO(code);
    console.log("response = ", response);
}

module.exports.authenticate = authenticate;
async function authenticate(strategy) {
    console.log("DEBUG: authenticate():");
    await passport.authenticate(strategy);
}
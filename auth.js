const https = require("https");
const env = require('dotenv').config();
const passport = require("passport");
const EveOnlineStrategy = require("passport-eveonline");


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
    const options = {
        hostname: 'login.eveonline.com',
        port: 443,
        path: '/v2/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic YzQ1ZTQ4YWZjMzZhNDhjNmI2NzQzMTUzMDUxZTc2OGM6Z1pEZ3VlcFRUbWUxYmx1a291VlNvOE44ZEFQRm9XM2NwU0hWWmFrQw==',
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
            });

            res.on('error', (e) => {
                console.error(e.message);
            });

            res.on('end', () => {
                resolve(userIdList = JSON.parse(data));
            })
        });

        req.on('error', (e) => {
            console.error(e.message);
        });

        req.write(payload);

        req.end();
    });
}

module.exports.startSSO = startSSO;
async function startSSO(code) {
    var response = await replyToSSO(code);
    console.log("response = ", response);
}

module.exports.authenticate = authenticate;
function authenticate(strategy) {
    passport.authenticate(strategy);
}
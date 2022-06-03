const express = require("express");
const app = express();

app.get("/", function (request, response) {
    console.log(request);
    response.send("<h1>Hello there</h1>");
});

app.listen(3000, function () {
    console.log("The server was started, listening on port 3000");
});
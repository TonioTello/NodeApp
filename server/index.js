const express = require("express");
const server = express();

// Middleware to parse JSON data in the request body : Content-Type', 'application/json
server.use(express.json());

const pingRoute = require("../routes/ping.routes");
const usersRoute = require("../routes/users.routes");
const tokensRoute = require("../routes/tokens.routes");

server.use("/ping", pingRoute);
server.use("/users", usersRoute);
server.use("/tokens", tokensRoute);

module.exports = server;
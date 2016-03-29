var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io").listen(http);

module.exports = {
  app: app,
  http: http,
  io: io
};

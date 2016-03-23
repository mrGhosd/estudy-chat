var bookshelf = require("../db");
var Chat = require("../models/chat");

var Chats = bookshelf.Collection.extend({
    model: Chat
});

module.exports = Chats;

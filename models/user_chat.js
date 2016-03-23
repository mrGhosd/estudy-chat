var bookshelf = require("../db");

var UserChat = bookshelf.Model.extend({
  tableName: 'user_chats'
});

module.exports = UserChat;

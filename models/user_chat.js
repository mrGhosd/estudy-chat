var bookshelf = require("../db");
var User = require('./user');
var Chat = require('./chat');

var UserChat = bookshelf.Model.extend({
  tableName: 'user_chats',
  user: function() {
    return this.belongsTo(User, 'user_id');
  },
  chat: function() {
    return this.belongsTo(Chat, 'chat_id');
  }
});

module.exports = UserChat;

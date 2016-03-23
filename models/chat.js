var bookshelf = require("../db");
var User = require('./user');
var UserChat = require('./user_chat');

var Chat = bookshelf.Model.extend({
  tableName: 'chats',
  users: function() {
    return this.belongsToMany(User, 'user_chats', 'user_id', 'chat_id');
  }
});

module.exports = Chat;

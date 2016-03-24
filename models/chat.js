var bookshelf = require("../db");
var User = require('./user');
var UserChat = require('./user_chat');

var Chat = bookshelf.model('Chat', {
  tableName: 'chats',
  users: function() {
    return this.belongsToMany('User', 'user_chats');
  },
  user_chats: function() {
    return this.hasMany(UserChat, 'chat_id');
  }
});

module.exports = Chat;

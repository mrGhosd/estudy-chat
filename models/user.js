var bookshelf = require("../db");
var Attach = require('./attach');
var Chat = require('./chat');
var UserChat = require('./user_chat');

var User = bookshelf.Model.extend({
  tableName: 'users',
  image: function() {
    return this.morphOne(Attach, 'attachable', ['attachable_type', 'attachable_id']);
  },
  chats: function() {
    return this.belongsToMany(Chat, 'user_chats', 'user_id', 'chat_id');
  }
});

module.exports = User;

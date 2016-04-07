var bookshelf = require("../db");
var Chat = require('./chat');
var User = require('./user');

var Message = bookshelf.model('Message', {
  tableName: 'messages',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo('User');
  },
  chat: function() {
    return this.belongsTo('Chat');
  }
});

module.exports = Message;

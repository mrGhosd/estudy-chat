var bookshelf = require("../db");
var Chat = require('./chat');
var User = require('./user');
var Attach = require('./attach');

var Message = bookshelf.model('Message', {
  tableName: 'messages',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo('User');
  },
  chat: function() {
    return this.belongsTo('Chat');
  },
  attaches: function() {
      return this.morphMany(Attach, 'attachable', ["attachable_type", "attachable_id"], 'Message');
  }
});

module.exports = Message;

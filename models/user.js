var bookshelf = require("../db");
var Attach = require('./attach');
var Chat = require('./chat');
var UserChat = require('./user_chat');

var User = bookshelf.model('User', {
  tableName: 'users',
  hidden: ['password'],
  image: function() {
    return this.morphOne(Attach, 'attachable', ["attachable_type", "attachable_id"], 'User');
  },
  chats: function() {
    return this.belongsToMany('Chat', 'user_chats');
  },
  messages: function() {
    return this.hasMany('Message', 'chat_id');
  },
  virtuals: {
    imageData: function() {
      if (this.related('image').toJSON().fileData) {
        return { image: { url: "/uploads/image/" + this.related('image').get('id') + "/" + this.related('image').get('file') } }
      }
      else {
        return {};
      }
    }
  }
});

module.exports = User;

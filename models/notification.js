var bookshelf = require("../db");
var User = require("./user");

var Notification = bookshelf.model('Notification', {
  tableName: 'notifications',
  notificationable: function() {
    return this.morphTo('notificationable', 'Message');
  }
});

module.exports = Notification;

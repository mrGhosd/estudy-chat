var bookshelf = require("../db");

var User = bookshelf.Model.extend({
  tableName: 'users'
});

module.exports = User;

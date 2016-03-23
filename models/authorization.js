var bookshelf = require("../db");
var User = require("./user");

var Authorization = bookshelf.Model.extend({
  tableName: 'authorizations',
  user: function() {
    return this.belongsTo(User);
  }
});

module.exports = Authorization;

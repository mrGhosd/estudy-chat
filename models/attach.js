var bookshelf = require("../db");
var User = require("./user");

var Attach = bookshelf.model('Attach', {
  tableName: 'attaches',
  attachable: function() {
    return this.morphTo('attachable', 'User');
  }
});

module.exports = Attach;

var bookshelf = require("../db");
var User = require("./user");

var Attach = bookshelf.Model.extend({
  tableName: 'attaches',
  imageable: function() {
    return this.morphTo('attachable', ['attachable_type', 'attachable_id'], User);
  }
});

module.exports = Attach;

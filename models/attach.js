var bookshelf = require("../db");
var User = require("./user");

var Attach = bookshelf.model('Attach', {
  tableName: 'attaches',
  attachable: function() {
    return this.morphTo('attachable', 'User', 'Message');
  },
  virtuals: {
    fileData: function() {
      var attach = this.attributes;
      if (Object.keys(attach).length > 0) {
        return { attach: { url: "/uploads/"+ attach.type.toLowerCase() +"/" + attach.id + "/" + attach.file } }
      }
    }
  }
});

module.exports = Attach;

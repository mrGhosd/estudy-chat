var bookshelf = require("../db");
var User = require("./user");
var awsClient = require('../aws');

var fileName;

var Attach = bookshelf.model('Attach', {
  tableName: 'attaches',
  attachable: function() {
    return this.morphTo('attachable', 'User', 'Message');
  },
  virtuals: {
    url: function() {
      var attributes = this.attributes;
      var attach = "uploads/" + attributes.file;
      var loadObject = awsClient.getSignedUrl('getObject', { Bucket: 'estudydev', Key: attach });
      return loadObject;
    }
  }
});

module.exports = Attach;

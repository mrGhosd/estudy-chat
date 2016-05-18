var bookshelf = require("../db");
var User = require("./user");
var awsClient = require('../aws');

var fileName;

var Attach = bookshelf.model('Attach', {
  tableName: 'attaches',
  constructor: function() {
    var objectExists = Object.keys(arguments).length > 0;
    if (objectExists) {
      fileName = arguments['0']['file'];
      // console.log(arguments);
    }
    bookshelf.Model.apply(this, arguments);
  },
  // initialize: function() {
  //   var keys = Object.keys(this.attributes).length;
  //   if (keys > 0) {
  //     console.log(this.attributes);
  //   }
  // },
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

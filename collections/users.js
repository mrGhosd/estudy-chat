var bookshelf = require("../db");
var User = require("../models/user");

var Users = bookshelf.Collection.extend({
    model: User
});

module.exports = Users;

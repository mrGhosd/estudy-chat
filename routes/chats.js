var express = require('express');
var router = express.Router();
var Chats = require("../collections/chats");
var User = require("../models/user");
var Message = require("../models/message");
var Authorization = require("../models/authorization")
var jwtDecode = require('jwt-decode');
var debug = require('debug');

router.get('/', function(req, res) {
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user']})
    .then(function(response) {
      return response.toJSON().user;
    })
    .then(function (user){
      return User.where({id: user.id}).fetch({withRelated: [ 'chats']})
    })
    .then(function (fetchedUser) {
      return fetchedUser.related('chats');
    })
    .then(function(chatsList) {
      return chatsList.load(['users.image', 'messages.user', 'messages.chat']);
    })
    .then(function(list) {
      res.json({chats: list.toJSON({virtuals: true})});
    });
  }
  else {
      res.json({list: 'list of dialogs'});
  }

});
// define the about route
router.get('/:id', function(req, res) {
  res.send('Particular dialog');
});

module.exports = router;

var express = require('express');
var router = express.Router();
var Chats = require("../collections/chats");
var User = require("../models/user");
var Chat = require("../models/chat");
var Message = require("../models/message");
var Authorization = require("../models/authorization")
var jwtDecode = require('jwt-decode');
var debug = require('debug');

router.get('/', function(req, res) {
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
    .then(function(response) {
      return response.toJSON().user;
    })
    .then(function (user){
      return User.where({id: user.id}).fetch({withRelated: [ 'chats' ]})
    })
    .then(function (fetchedUser) {
      return fetchedUser.related('chats');
    })
    .then(function(chatsList) {
      return chatsList.load(['users.image', 'messages.user', 'messages.chat', { messages: function(db) {
        db.limit(1);
      }}]);
    })
    .then(function(list) {
      res.json({chats: list.toJSON({virtuals: true})});
    });
  }
  else {
      res.json({list: 'list of dialogs'});
  }
});

router.get('/:id', function(req, res) {
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
    .then(function(response) {
      return response.toJSON().user;
    })
    .then(function (user){
      return Chat.where({id: req.params.id}).fetch({withRelated:
        [ 'users.image', 'messages.user', 'messages.chat', 'messages.user.image', { messages: function(db) {
          db.limit(20);
      }}]});
    })
    .then(function (fetchedUser) {
      res.json({chat: fetchedUser.toJSON({virtuals: true})});
    })
  }
  else {
    res.json({error: 'You must be authorized'});
  }
});

module.exports = router;

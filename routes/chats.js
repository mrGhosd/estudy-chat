var express = require('express');
var router = express.Router();
var Chats = require("../collections/chats");
var User = require("../models/user");
var UserChat = require('../models/user_chat');
var Chat = require("../models/chat");
var Message = require("../models/message");
var Authorization = require("../models/authorization")
var jwtDecode = require('jwt-decode');
var debug = require('debug');
var bookshelf = require("../db");
var pm = require('bookshelf-pagemaker')(bookshelf);
var knex = bookshelf.knex;

router.get('/', function(req, res) {
  var authId;
  try {
    authId = jwtDecode(req.headers.estudyauthtoken).id;
  }
  catch(e) {
    res.status(401).json({errors: 'Unauthorized'});
  }

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
        db.orderBy('id', 'desc').limit(1);
      }}]);
    })
    .then(function(list) {
      res.json({chats: list.toJSON({virtuals: true})});
    });
  }
});

router.post('/', function(req, res) {
  var authId;
  var currentUser;
  try {
    authId = jwtDecode(req.headers.estudyauthtoken).id;
  }
  catch(e) {
    res.status(401).json({errors: 'Unauthorized'});
  }

  Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
  .then(function(response) {
    currentUser = response.toJSON().user;
    return currentUser;
  })
  .then(function(user) {
    var promises = [];
    if (req.body.chat.users.indexOf(user.id) === -1) {
      req.body.chat.users.push(user.id);
    }
    // req.body.chat.users.forEach(function(item) {
    //   var promise =
    // });
    console.log(req.body.chat.users);
    return knex.raw("select * from user_chats where chat_id in (select chat_id from user_chats group by chat_id having count(*) > 1) and user_id in (??);", [req.body.chat.users]);
    // return Chat.query({ where:  { user_chats: { user_id: req.body.chat.users } } });
  })
  .then(function(userChat) {
    console.log(userChat.rows);
  });
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
        [ 'users.image', 'messages.user', 'messages.chat', 'messages.user.image', 'messages.attaches', { messages: function(db) {
          db.orderBy('id', 'desc').limit(20);
      }}]});
    })
    .then(function (fetchedUser) {
      console.log(fetchedUser.toJSON({virtuals: true}).messages[0]);
      res.json({chat: fetchedUser.toJSON({virtuals: true})});
    })
  }
  else {
    res.json({error: 'You must be authorized'});
  }
});

module.exports = router;

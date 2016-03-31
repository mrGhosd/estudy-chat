var express = require('express');
var bookshelf = require("../db");
var router = express.Router();
var User = require("../models/user");
var Chat = require("../models/chat");
var Message = require("../models/message");
var Authorization = require("../models/authorization")
var jwtDecode = require('jwt-decode');
var io = require('../utils/app_base').io;
var pm = require('bookshelf-pagemaker')(bookshelf);

router.get('/', function(req, res) {
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    var page = req.param('page');
    var chatId = req.param('chat_id');
    pm(Message).forge()
    .limit(20)
    .page(page || 2)
    .query(function(db) {
      db.where('chat_id', chatId);
    })
    .order('desc')
    .paginate({
      request: req,
      withRelated: ['user.image', 'chat.users.image']
    })
    .end()
    .then(function(messages) {
      res.json({messages: messages})
    });
  }
  else {

  }
});

router.post('/', function(req, res) {
  var message = req.body.message;
  message.created_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
    .then(function(response) {
      return response.toJSON().user;
    })
    .then(function(currentUser) {
      if (message.chat_id) {
        return Message.forge({
          chat_id: message.chat_id,
          user_id: message.user_id,
          text: message.text
        }).save();
      }
    })
    .then(function(message) {
      return Message.forge({id: message.toJSON().id}).fetch({withRelated: ['user.image', 'chat.users.image']});
    })
    .then(function(fullMessage) {
      res.json({message: fullMessage.toJSON({virtuals: true})});
      fullMessage.toJSON().chat.users.map(function(user) {
        var id = user.id;
        var eventName = 'user'+id+'chatmessage';
        io.sockets.emit(eventName, { obj: fullMessage.toJSON() });
      });
    });
  }
  else {
      res.json({list: 'list of dialogs'});
  }
});

module.exports = router;

var express = require('express');
var bookshelf = require("../db");
var router = express.Router();
var User = require("../models/user");
var Attach = require("../models/attach");
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
  var messageParams = req.body.message;
  messageParams.created_at = new Date().toISOString();
  messageParams.updated_at = new Date().toISOString();
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
    .then(function(response) {
      return response.toJSON().user;
    })
    .then(function(currentUser) {
      if (messageParams.text === "") throw new Error("Text can't be blank");
      if (messageParams.chat_id) {
        return Message.forge({
          chat_id: messageParams.chat_id,
          user_id: messageParams.user_id,
          text: messageParams.text
        }).save();
      }
      else {
        //create new chat
      }
    })
    .then(function(newMessage) {
      var promises = [];
      if (messageParams.attaches) {
        promises.push(newMessage);
        messageParams.attaches.map(function(attach) {
          var newAttach = new Attach({id: attach.id}).save({ attachable_id: newMessage.toJSON().id });
          promises.push(newAttach);
        });
      }
      return Promise.all(promises);
    })
    .then(function(message) {
      return Message.forge({id: message[0].toJSON().id}).fetch({withRelated: ['user.image', 'chat.users.image', 'attaches']});
    })
    .then(function(fullMessage) {
      res.json({message: fullMessage.toJSON({virtuals: true})});
      fullMessage.toJSON().chat.users.map(function(user) {
        var id = user.id;
        var eventName = 'user'+id+'chatmessage';
        io.sockets.emit(eventName, { obj: fullMessage.toJSON() });
      });
    })
    .catch(function(error) {
      res.status(422).json({errors: [error.message]});
    });
  }
  else {
      res.json({list: 'list of dialogs'});
  }
});

module.exports = router;

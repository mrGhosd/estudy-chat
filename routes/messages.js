var express = require('express');
var bookshelf = require("../db");
var router = express.Router();
var User = require("../models/user");
var Attach = require("../models/attach");
var Chat = require("../models/chat");
var Message = require("../models/message");
var Notification = require("../models/notification");
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
  var currentUser;
  var createdMessage;
  var messageParams = req.body.message;
  var messageNotifications;
  messageParams.created_at = new Date().toISOString();
  messageParams.updated_at = new Date().toISOString();
  var authId = jwtDecode(req.headers.estudyauthtoken).id;
  if (authId) {
    Authorization.where({id: authId}).fetch({withRelated: ['user' ]})
    .then(function(response) {
      currentUser = response.toJSON().user;
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
      var msg = newMessage.toJSON();
      var promises = [];
      if (messageParams.attaches) {
        promises.push(newMessage);
        messageParams.attaches.map(function(attach) {
          var newAttach = new Attach({id: attach.id}).save({ attachable_id: msg.id });
          promises.push(newAttach);
        });
      }
      return Promise.all(promises);
    })
    .then(function(message) {
      return Message.forge({id: message[0].toJSON().id}).fetch({withRelated: ['user.image', 'chat.users.image', 'attaches']});
    })
    .then(function(message) {
      createdMessage = message;
      var promises = [];
      createdMessage.toJSON().chat.users.forEach(function(item) {
        if (item.id !== currentUser.id) {
          var notificate = Notification.forge({
            user_id: item.id,
            notificationable_id: createdMessage.toJSON().chat.id,
            notificationable_type: 'Chat',
            active: true,
            created_at: messageParams.created_at,
            updated_at: messageParams.updated_at
          }).save();
        }
        promises.push(notificate);
      });
      return Promise.all(promises);
    })
    .then(function(notifications) {
      res.json({message: createdMessage.toJSON({virtuals: true})});
      createdMessage.toJSON().chat.users.map(function(user, index) {
        var hash = {};
        var id = user.id;
        var eventName = 'user'+id+'chatmessage';
        hash.obj = createdMessage.toJSON();

        var notification = notifications[index];
        if (notification && notification.toJSON().user_id === user.id) {
          hash.notification = notification;
        }
        io.sockets.emit(eventName, hash);
      });
    })
    .catch(function(error) {
      console.log(error);
      res.status(422).json({errors: [error.message]});
    });
  }
  else {
      res.json({list: 'list of dialogs'});
  }
});

module.exports = router;

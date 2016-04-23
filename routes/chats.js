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
      return User.where({id: user.id}).fetch({withRelated: [ {chats: function(db) {
        db.where('user_chats.active', '=', 'true');
      }} ]})
    })
    .then(function (fetchedUser) {
      return fetchedUser.related('chats');
    })
    .then(function(chatsList) {
      var promises = [];
      chatsList.toJSON().forEach(function(item) {
        var chatPromise = Chat.where({id: item.id}).fetch({withRelated: [
          'users.image', 'messages.user', 'messages.chat', { messages: function(db) {
            db.orderBy('id', 'desc').limit(1);
          }}
        ]});
        promises.push(chatPromise);
      });
      return Promise.all(promises);
    })
    .then(function(list) {
      var chatsList = list.map(function(item) {
        return item.toJSON({virtuals: true});
      });
      res.json({chats: chatsList});
    });
  }
});

router.post('/', function(req, res) {
  var authId;
  var currentUser;
  var chatParams = req.body.chat;
  var createdChat;
  chatParams.created_at = new Date().toISOString();
  chatParams.updated_at = new Date().toISOString();
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
    if (chatParams.users.length < 1 || !chatParams.message) {
      var errors = "";
      if (chatParams.users.length < 1) {
        errors += "Users: Can't be blank" + ";";;
      }
      if (!chatParams.message) {
        errors += "Message: Can't be blank" + ";";
      }

      throw new Error(errors);
    }

    var promises = [];
    if (chatParams.users.indexOf(user.id) === -1) {
      chatParams.users.push(user.id);
    }
    return knex.raw("select * from user_chats where user_id in (??) and active=false;", [chatParams.users]);
  })
  .then(function(userChat) {
    var findedChat = userChat.rows
    if (userChat.rows.length === 0) {
      return createChat(chatParams);
    }
    else {
        return Chat.where({id: findedChat[0].chat_id}).fetch({withRelated: ['users']}).then(function(response) {
          var userChatUsers = response.toJSON().users;
          var condition = chatParams.users.length === userChatUsers.length &&
            userChatUsers.length === numberOfMatches(userChatUsers, chatParams.users);
          findedChat.forEach(function(item) {
            if (condition) {
                UserChat.where({id: item.id}).save({active: true}, {patch: true})
              }
            });
            if (!condition) {
              return createChat(chatParams);
            }
        });

      return Chat.where({id: findedChat[0].chat_id}).fetch();
    }
  })
  .then(function(chat) {
    createdChat = chat;
    var promises = [];
    chatParams.users.forEach(function(id) {
      var promise = UserChat.where({user_id: id, chat_id: createdChat.toJSON().id}).fetch();
      promises.push(promise);
    });
    return Promise.all(promises);
  })
  .then(function(userChats) {
    var promises = [];
    userChats.forEach(function(userChat, index) {
      if (!userChat) {
        var userId = chatParams.users[index];
        var promise = UserChat.forge({
          user_id: userId,
          chat_id: createdChat.toJSON().id,
          created_at: chatParams.created_at,
          updated_at: chatParams.updated_at
        }).save();
        promises.push(promise);
      }
    });
    var messagePromise = Message.forge({
      chat_id: createdChat.toJSON().id,
      user_id: currentUser.id,
      text: chatParams.message,
      created_at: chatParams.created_at,
      updated_at: chatParams.updated_at
    }).save();
    promises.push(messagePromise);
    return Promise.all(promises);
  })
  .then(function(chat) {
    return Chat.forge({ id: createdChat.toJSON().id }).fetch({withRelated:
      [ 'users.image', 'messages.user', 'messages.chat', 'messages.user.image', 'messages.attaches', { messages: function(db) {
        db.orderBy('id', 'desc').limit(1);
    }}]});
  })
  .then(function(chat) {
    res.json({ chat: chat });
  })
  .catch(function(error) {
    var errorsArr = error.message.split(';');
    var errorsHash = {};
    errorsArr.forEach(function(item) {
      if (item.match(/Users/)) {
        var errorMsg = item.substr("Users".length + 2, item.length);
        errorsHash.users = errorMsg;
      }
      if (item.match(/Message/)) {
        var errorMsg = item.substring("Message".length + 2, item.length);
        errorsHash.message = errorMsg;
      }
    });
    console.log(error);
    res.status(422).json({errors: errorsHash});
  });;
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
    .then(function (fetchedChat) {
      if (fetchedChat) {
        res.json({chat: fetchedChat.toJSON({virtuals: true})});
      }
      else {
        res.status(404);
      }
    })
  }
  else {
    res.json({error: 'You must be authorized'});
  }
});

router.delete('/:id', function(req, res) {
  var authId;
  var currentUser;
  console.log(req.params);
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
    return UserChat.where({user_id: user.id, chat_id: req.params.id}).fetch();
  })
  .then(function(userChat) {
    if (userChat.toJSON()) {
      return userChat.save({active: false});
    }
  })
  .then(function(destroyedUserChat) {
    res.json({ chat: destroyedUserChat.toJSON() });
  });
});

var createChat = function (chatParams) {
  return Chat.forge({
    created_at: chatParams.created_at,
    updated_at: chatParams.updated_at
  }).save();
}

var numberOfMatches = function(defaultArr, checkArr) {
  var numberOfMatches = 0;
  defaultArr.forEach(function(item) {
    if (checkArr.indexOf(item) > -1) {
      numberOfMatches++;
    }
  });
  return numberOfMatches;
}

module.exports = router;

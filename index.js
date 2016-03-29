var appBase = require("./utils/app_base");
var express = require("express"),
    app = appBase.app,
    http = appBase.http,
    io = appBase.io,
    bookshelf = require("./db"),
    Users = require("./collections/users"),
    chats = require("./routes/chats"),
    messages = require("./routes/messages");
    cors = require("cors"),
    bodyParser = require("body-parser");

//app.set("ipaddr", "188.166.99.8");
app.set("ipaddr", '127.0.0.1');
app.set("port", 5001);

app.use(cors());
app.use(bodyParser.json());
app.use('/chats', chats);
app.use('/messages', messages);

io.on('connection', function(socket) {
  socket.on('chatmessage', function(data) {
    var usersEmails = data.chat.users.map(function(user) {
      var id = user.id;
      var eventName = 'user'+id+'chatmessage';
      io.sockets.emit(eventName, { obj: data });
    });
  });
});

http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log("RUN", app.get("ipaddr"));
}).on("error", function(error){
    console.log(error);
});

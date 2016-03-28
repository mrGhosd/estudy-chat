var express = require("express"),
    app = express(),
    http = require("http").createServer(app),
    bookshelf = require("./db"),
    Users = require("./collections/users"),
    chats = require("./routes/chats"),
    messages = require("./routes/messages");
    cors = require("cors"),
    bodyParser = require("body-parser");

//app.set("ipaddr", "188.166.99.8");
app.set("ipaddr", '127.0.0.1');
app.set("port", 8080);

app.use(cors());
app.use(bodyParser.json());
app.use('/chats', chats);
app.use('/messages', messages);

http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log("RUN", app.get("ipaddr"));
}).on("error", function(error){
    console.log(error);
});

var express = require("express"),
    app = express(),
    http = require("http").createServer(app),
    bookshelf = require("./db"),
    Users = require("./collections/users"),
    chats = require("./routes/chats"),
    cors = require("cors");

//app.set("ipaddr", "188.166.99.8");
app.set("ipaddr", '127.0.0.1');
app.set("port", 8080);

app.use(cors());
app.use('/chats', chats);

http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log("RUN", app.get("ipaddr"));
}).on("error", function(error){
    console.log(error);
});

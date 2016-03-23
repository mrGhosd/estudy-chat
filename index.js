var express = require("express"),
    app = express(),
    http = require("http").createServer(app)

//app.set("ipaddr", "188.166.99.8");
app.set("ipaddr", '127.0.0.1');
app.set("port", 8080);

var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    database : 'estudy_development',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users'
});

var Users = bookshelf.Collection.extend({
    model: User
});

Users.forge().fetch().then(function(collection) {
  console.log(collection.toJSON());
});


app.get('/', function (req, res) {
  console.log(req.body);
  res.send('Hello World!');
});


http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log("RUN", app.get("ipaddr"));
}).on("error", function(error){
    console.log(error);
});

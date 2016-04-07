var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    database : 'estudy_development',
    charset  : 'utf8',
    "timezone": "UTC"  
  }
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
bookshelf.plugin('virtuals');
bookshelf.plugin('visibility')
module.exports = bookshelf;

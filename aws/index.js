var AWS = require('aws-sdk');
var config = require('./config.json');
AWS.config.update(config);
AWS.config.setPromisesDependency(require('bluebird'));

module.exports = new AWS.S3();

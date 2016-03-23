var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({list: 'list of dialogs'});
});
// define the about route
router.get('/:id', function(req, res) {
  res.send('Particular dialog');
});

module.exports = router;

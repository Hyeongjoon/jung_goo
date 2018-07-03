var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('여긴 그냥');
});

router.get('/anony_cart', function(req, res, next) {
	  res.send('여긴 익명');
});

module.exports = router;
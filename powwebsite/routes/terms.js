var express = require('express');
var router = express.Router();

var globals         = require('./globals');

/* GET terms page. */
router.get('/', function(req, res) {
  res.render('terms', {
    title: 'Terms - Weed Price Index',
    stylesheet: '/stylesheets/index.css',
    states: globals.states
  });
});

module.exports = router;
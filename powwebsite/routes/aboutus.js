var express = require('express');
var router = express.Router();

var globals         = require('./globals');

/* GET about us page. */
router.get('/', function(req, res) {
  res.render('aboutus', {
    title: 'About Us - Weed Price Index',
    stylesheet: '/stylesheets/index.css',
    states: globals.states,
    description: 'description',
    keywords: 'keywords',
    icon: '/public/images/icon.gif'
  });
});

module.exports = router;
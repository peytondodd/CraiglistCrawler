var express = require('express');
var router = express.Router();

var globals         = require('./globals');

/* GET terms page. */
router.get('/', function(req, res) {
  res.render('terms', {
    title: 'Terms - Weed Price Index',
    stylesheet: '/stylesheets/index.css',
    states: globals.states,
    description: 'Looking for the price of weed? LeafyExchange can help you find the prices of pot in your area!',
    keywords: '420,weed,pot,marijuana,green,price of weed, price of pot, price of marijuana, legalize, medical, medicinal, herb, herbal',
    icon: '/public/images/icon.gif'
  });
});

module.exports = router;
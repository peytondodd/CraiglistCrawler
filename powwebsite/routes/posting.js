var express         = require('express');
var router          = express.Router()
;
var globals         = require('./globals');
var rawHTMLProvider   = globals.rawHTMLProvider;

router.post('/postingbody/:id', function(req, res) {
    var params = req.params.id.split('-');
    var id = params[params.length-1];

    if (isNan(id)) {
        res.json("");
        return;
    }

    rawHTMLProvider.getContent(id, function(error, doc) {
        res.json(doc);
    })
});

// Get the main page with a list of topics
router.get('/:id', function(req, res) {
    var params = req.params.id.split('-');
    var id = params[params.length-1];

    if (isNaN(id)) {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
        return;
    }

    rawHTMLProvider.getContent(id, function(error, doc) {
        if (error || doc === undefined || !('posting_body' in doc)) {
            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
            return;
        }

        res.render('posting', {
            title: 'Weed Posting Page',
            stylesheet: '/stylesheets/posting.css',
            content: doc['posting_body'],
            url: doc['url'],
            state: doc['state'],
            city: doc['city'],
            latitude: doc['latitude'],
            longitude: doc['longitude'],
            states: globals.states,
            description: 'Looking for the price of weed? LeafyExchange can help you find the prices of pot in your area!',
            keywords: '420,weed,pot,marijuana,green,price of weed, price of pot, price of marijuana, legalize, medical, medicinal, herb, herbal',
            icon: '/public/images/icon.gif'
        });
        return;
    })
});

module.exports = router;
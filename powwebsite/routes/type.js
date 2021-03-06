var express         = require('express');
var router          = express.Router()
;
var globals         = require('./globals');

router.post('/:typeName', function(req, res) {
    var typeName = req.params.typeName;
    console.log(typeName);

    var type = null;
    for (var i = 0; i < globals.allTypes.length; ++i) {
        if (globals.allTypes[i]['name'].toUpperCase() === typeName.toUpperCase()) {
            type = globals.allTypes[i];
            break;
        }
    }

    // Invalid type
    if (type === null) {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
        return;
    }

    var postingTagsInfoId = [];
    for (var i = 0; i < globals.postingTags.length; ++i) {
        if (globals.postingTags[i]['type_id'] === type['id']) {
            postingTagsInfoId.push(globals.postingTags[i]['id']);
        }
    }

    var postingTagsInfo = [];
    for (var i = 0; i < globals.postings.length; ++i) {
        if (postingTagsInfoId.indexOf(globals.postings[i]['id']) !== -1) {
            postingTagsInfo.push(globals.postings[i]);
        }
    }

    res.json(postingTagsInfo);
});

// Get the main page with a list of topics
router.get('/:typeName', function(req, res) {
    var typeName = req.params.typeName;

    var type = null;
    for (var i = 0; i < globals.allTypes.length; ++i) {
        if (globals.allTypes[i]['name'].toUpperCase() === typeName.toUpperCase()) {
            type = globals.allTypes[i];
            break;
        }
    }

    // Invalid type
    if (type === null) {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
        return;
    }

    var postingTagsInfoId = [];
    for (var i = 0; i < globals.postingTags.length; ++i) {
        if (globals.postingTags[i]['type_id'] === type['id']) {
            postingTagsInfoId.push(globals.postingTags[i]['id']);
        }
    }

    var postingTagsInfo = [];
    for (var i = 0; i < globals.postings.length; ++i) {
        if (postingTagsInfoId.indexOf(globals.postings[i]['id']) !== -1) {
            postingTagsInfo.push(globals.postings[i]);
        }
    }

    var topStrains = [];
    var numStrain = 0;
    for (var i = 0; i < globals.allStrains.length; ++i) {
        if (globals.allStrains[i]['type'] === type['id']) {
            ++numStrain;
            if (numStrain > 4) {
                break;
            }

            var strain = globals.allStrains[i];
            strain['url'] = '/strain/' + strain['name'].replace(/ /g, '-');
            topStrains.push(globals.allStrains[i]);
        }
    }

    res.render('type', {
        title: 'LeafyExchange: The Best ' + type['name'] + ' Prices and Delivery Source',
        stylesheet: '/stylesheets/type.css',
        session: req.session,
        type: type,
        postings: postingTagsInfo,
        pricesString: globals.commonHelper.constructPriceStringArray(postingTagsInfo),
        quantitiesString: globals.commonHelper.constructQuantityStringArray(postingTagsInfo),
        topStrains: topStrains,
        states: globals.states,
        description: 'Looking for ' + type['name'] + ' Weed? LeafyExchange has the best prices of ' + type['name'] + ' Weed in the US. ' + type['description'],
        keywords: type['name'] + ' Weed, price of ' + type['name'] + ' Weed, buy ' + type['name'] + ' Weed, sell ' + type['name'] +' Weed, 420, green, weed, pot, marijuana, legalize, medical, medicinal, herb, herbal',
        icon: '/images/icon.png',
        javascriptSrcs:
            ['http://maps.googleapis.com/maps/api/js',
             'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerwithlabel/src/markerwithlabel_packed.js',
             '/javascripts/type.js']
    });
});

module.exports = router;
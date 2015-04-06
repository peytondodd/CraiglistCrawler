var PostingLocationProvider = require('./postinglocationprovider').PostingLocationProvider;
var postingLocationProvider = new PostingLocationProvider();
var PricesProvider = require('./pricesprovider').PricesProvider;
var pricesProvider = new PricesProvider();
var RawHTMLProvider = require('./rawhtmlprovider').RawHTMLProvider;
var rawHTMLProvider = new RawHTMLProvider();
var CommonHelper = require('./commonHelper').CommonHelper;
var commonHelper = new CommonHelper();

// For ex: [10.0, 4.0, 40.0, 7.0, 60.0, 14.0, 100.0, 1.0, 28.0, 200.0, 4.0, 112.0, 650.0, 253.0, 414.0, 4380.0]
function ParsePrices(prices) {
    if (!prices) {
        return prices;
    }

    var priceArray = commonHelper.ParseArrayString(prices, ',', 3, 1000, true);

    return priceArray;
}

// For ex: [ 0.125  0.25   0.5  ] g[ 0.125  0.25   0.5  ] oz
function ParseQuantities(quantities) {
    if (!quantities) {
        return quantities;
    }

    var quantitiesType = quantities.split('[');

    var quantitiesArray = [];
    quantitiesArray['gram'] = null;
    quantitiesArray['ounce'] = null;

    // One empty, one for gram, one for oz
    if (quantitiesType.length < 2) {
        return quantitiesArray;
    }

    var gramArray = commonHelper.ParseArrayString(quantitiesType[1], ' ', 1.1, 200, true);
    quantitiesArray.push(gramArray);

    // One empty, one for gram, one for oz
    if (quantitiesType.length < 3) {
        return quantitiesArray;
    }
    var ounceArray = commonHelper.ParseArrayString(quantitiesType[2], ' ', 0.1, 200, false);
    quantitiesArray.push(ounceArray);

    return quantitiesArray;
}

var postings = [];

// function UpdateCache(error, docs) {
//     if (error != null) {
//         console.error('error to get postings: ' + error.stack);
//         process.exit(1);
//     }

//     postings = [];

//     for (var i = 0; i < docs.length; ++i)
//     {
//         postings[i] = {};

//         postings[i]['id'] = docs[i]['id'];
//         postings[i]['price'] = docs[i]['price'];
//         postings[i]['quantity'] = docs[i]['quantity'];
//         postings[i]['unit'] = docs[i]['unit'];
//         postings[i]['state'] = docs[i]['state'];
//         postings[i]['city'] = docs[i]['city'];
//         postings[i]['datePosted'] = docs[i]['datePosted'];
//         postings[i]['title'] = docs[i]['title'];
//         postings[i]['url'] = ReplaceAll(' ', '-', postings[i]['title']);
//         postings[i]['url'] += "-" + postings[i]['id'];

//         postings[i]['lat'] = docs[i]['lat1'];
//         postings[i]['lng'] = docs[i]['lng1'];

//         if (postings[i]['lat'] == null || postings[i]['lng'] == null) {
//             postings[i]['lat'] = docs[i]['lat2'];
//             postings[i]['lng'] = docs[i]['lng2'];
//         }
//     }

//     console.log("Cache has " + postings.length + " entries")
// }

// pricesProvider.getPostings(function(error, docs) {
//     UpdateCache(error, docs);
//     exports.postings = postings;
// })

function UpdateCache(error, docs) {
    if (error != null) {
        console.error('error to get postings: ' + error.stack);
        process.exit(1);
    }

    postings = [];

    for (var i = 0; i < docs.length; ++i)
    {
        postings[i] = {};

        postings[i]['id'] = docs[i]['id'];
        postings[i]['price'] = ParsePrices(docs[i]['price']);
        postings[i]['quantity'] = ParseQuantities(docs[i]['quantity']);
        postings[i]['state'] = docs[i]['state'];
        postings[i]['city'] = docs[i]['city'];
        postings[i]['datePosted'] = docs[i]['datePosted'];
        postings[i]['title'] = docs[i]['title'];
        postings[i]['url'] = commonHelper.ReplaceAll(' ', '-', postings[i]['title']);
        postings[i]['url'] += "-" + postings[i]['id'];

        postings[i]['lat'] = docs[i]['lat1'];
        postings[i]['lng'] = docs[i]['lng1'];

        if (postings[i]['lat'] == null || postings[i]['lng'] == null) {
            postings[i]['lat'] = docs[i]['lat2'];
            postings[i]['lng'] = docs[i]['lng2'];
        }
    }

    console.log("Cache has " + postings.length + " entries")
}

pricesProvider.getPostings(function(error, docs) {
    UpdateCache(error, docs);
    exports.postings = postings;
})

// Periodically refresh cache every 5 minutes
setInterval(function() {
    pricesProvider.getPostings(function(error, docs) {
        UpdateCache(error, docs);
        exports.postings = postings;
    })
}, 300000);

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
exports.states = states;

exports.pricesProvider = pricesProvider;
exports.postingLocationProvider = postingLocationProvider;
exports.rawHTMLProvider = rawHTMLProvider;
exports.commonHelper = commonHelper;



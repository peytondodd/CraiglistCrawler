var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var prices = require('./routes/prices');
var postings = require('./routes/postings');
var localBusinesses = require('./routes/localBusinesses');
var posting = require('./routes/posting');
var search = require('./routes/search');
var purchase = require('./routes/purchase');
var sale = require('./routes/sale');
var strain = require('./routes/strain');
var type = require('./routes/type');

var app = express();

// gzip/deflate outgoing responses
var compression = require('compression');
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Redirect 301 to www version only if it's not dev environment
if (app.get('env') !== 'dev') {
    app.get('/*', function(req, res, next) {
        if(/^www\./.test(req.headers.host)) {
            next();
        } else {
            res.redirect(req.protocol+'://www.'+req.headers.host+req.url,301);
        }
    });
}

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/search', search);
app.use('/postings', postings);
app.use('/localBusinesses', localBusinesses);
app.use('/prices', prices);
app.use('/posting', posting);
app.use('/purchase', purchase);
app.use('/sale', sale);
app.use('/type', type);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
    
    // app.use(function(err, req, res, next) {
    //     res.statusCode = 302;
    //     res.setHeader('Location', '/');
    //     res.end();
    // });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });

    // res.statusCode = 302;
    // res.setHeader('Location', '/');
    // res.end();
});

app.listen(3000);

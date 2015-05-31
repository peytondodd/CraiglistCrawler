var express         = require('express');
var globals         = require('./globals');
var router          = express.Router();

var globals         = require('./globals');
var userProvider   = globals.userProvider;

// Santity check purchase order request
function sanityCheckRequest(request) {
  if (request === null || request === undefined) {
    console.log("undefined");
    return false;
  }

  if (!('email' in request) ||
    !('username' in request) ||
    !('password' in request) ||
    !('retypedPassword' in request)) {
    console.log("missing fields");
    console.log(request);
    return false;
  }

  if (request['password'] != request['retypedPassword']) {
    console.log('Passwords do not match');
    return false;
  }

  var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if (emailRegex.test(request['email']) === false) {
    console.log('Email invalid ' + request['email']);
    return false;
  }

  return true;
}

// Sign Up
router.post('/signup', function(req, res) {// Sanity check
    if (!sanityCheckRequest(req.body))
    {
      console.log('Request format invalid');
      res.status(400).send('Signup Information Invalid. Please retry again.');
      res.end();
    } else {
      userProvider.insertUser(
        req.body['email'],
        req.body['username'],
        req.body['password'],
        function(error, doc) {
          if (error) {
            console.log(error);
            if (error.errno === 1062) {
              res.status(400).send('Email or username has already exists, please choose another one');
            } else {
              res.status(400).send('Fails to signup for new user');
            }
            res.end();
          } else {
            res.status(200).send('Signup successfully');
            res.end();
          }
        }
      );
    }
});

// Log In
router.post('/login', function(req, res) {
  if (req.session.logged) {
    res.status(400).send('Already login an account. Please logout of the current account first.');
  } else {
    userProvider.getUser(
      req.body['username'],
      req.body['password'],
      function(error, doc) {
        if (error) {
          console.log(error);
        } else {
          if (doc && doc.length == 1) {
            req.session.logged = true;
            req.session.user = doc[0];
            res.status(200).send('Login account successfully');
          } else {
            res.status(400).send('Either username or password is incorrect. Please try again');
          }
        }
      }
    );
  }
});

// Log Out
router.post('/logout', function(req, res) {
  if (req.session.logged) {
    req.session.logged = false;
  }

  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
});

router.get('/logout', function(req, res) {

  if (req.session.logged) {
    req.session.logged = false;
  }

  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
});

module.exports = router;
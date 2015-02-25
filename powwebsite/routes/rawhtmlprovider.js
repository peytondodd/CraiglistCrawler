var mysql      = require('mysql');
var configs    = require("./config");

var connection = mysql.createConnection({
  host     : configs.dbhost,
  user     : configs.dbuser,
  password : configs.dbpassword
});

RawHTMLProvider = function() {
  console.log("New RawHTMLProvider");
  this.connection = mysql.createConnection({
    host     : configs.dbhost,
    port     : configs.dbport,
    user     : configs.dbuser,
    password : configs.dbpassword
  });

  // Start the connection
  this.connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });

  // Specify which database to use
  this.connection.query('USE ' + configs.dbdatabase, function(err, rows) {
    if (err)
      console.error('error use database: ' + err.stack); // 'ER_BAD_DB_ERROR'
      return;
  });
};

exports.RawHTMLProvider = RawHTMLProvider;
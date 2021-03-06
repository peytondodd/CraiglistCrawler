var globals         = require('./globals');
var format          = require('string-format');
var nodemailer      = require('nodemailer');
var CommonHelper    = require('./commonHelper').CommonHelper;
var commonHelper    = new CommonHelper();

var MySQLConnectionProvider  = require('./mysqlConnectionProvider.js').MySQLConnectionProvider;
var connectionProvider = new MySQLConnectionProvider();

format.extend(String.prototype);

var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'leafyexchange@gmail.com',
    pass: '420pontius'
  }
});

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = { /* apiKey: 'what is our API key?' */ }
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var MIN_PER_PERIODIC_PROCESS_PURCHASE_ORDER = 0.5;
var MAX_PURCHASE_ORDER_PROCESS_EACH_TIME = 2;
var MAX_EMAIL_SENT_PER_PURCHASE_ORDER = 10;

var MIN_PER_PERIODIC_SENT_MESSAGE = 0.5;
var MAX_MESSAGES_SENT_EACH_TIME = 1;


PeriodicProcess = function() {
};

function geocodeAndGetSeller(order) {
  console.log('geocodeAndGetSeller');

  geocoder.geocode(order['deliveryLocation'], function(err, res) {
    if (err) {
      console.log('Fail to geocode zipcode ' + order['deliveryLocation'] + ' for id ' + order['purchaseOrderId']);
      // TODO: log some sort of error here
    } else {
      getSellers(
        order['email'],
        order['purchaseOrderId'],
        res[0]['latitude'],
        res[0]['longitude'],
        order['lowPrice'],
        order['highPrice'],
        order['quantity'],
        order['deliveryDate']);

      var connection2 = connectionProvider.getConnection();

      var setProcessedPurchaseOrder = 'UPDATE purchase_orders SET processed = 1 WHERE purchaseOrderId = ' + order['purchaseOrderId'];

      connection2.query(setProcessedPurchaseOrder, function(err, rows) {
        console.log('Finished processing purchase order ' + order['purchaseOrderId']);
      });

      connection2.end();
    }
  });
}

function ProcessPurchaseOrders() {
    console.log("ProcessPurchaseOrders");

    var getPurchaseOrders = 'SELECT * FROM purchase_orders WHERE processed = 0 AND deliveryDate >= CURDATE() ORDER BY deliveryDate ASC, requestDate DESC LIMIT ' + MAX_PURCHASE_ORDER_PROCESS_EACH_TIME;

    var connection = connectionProvider.getConnection();
    var getPurchaseQuery = connection.query(getPurchaseOrders, function(err, rows) {
        if (err) {
            console.log('Fail to query for unprocessed purchase orders ' + err);
            return;
        } else {
            console.log('Process ' + rows.length + ' purchase orders');

            for (var i = 0; i < rows.length; ++i) {
                var order = rows[i];

                console.log('Attempt to process order ' + order['purchaseOrderId']);

                geocodeAndGetSeller(order);
            }
        }
    });

    console.log(getPurchaseQuery.sql);
    connection.end();
}

function getSellers(buyerEmail, purchaseOrderId, purchaseLatitude, purchaseLongitude, lowPrice, highPrice, quantity, deliveryDate) {
  console.log('getSellers ' + purchaseOrderId);

  var sellersQuery =
    'SELECT DISTINCT \
      `email`, \
      `price_fk`, \
      `url` \
    FROM \
      (SELECT `posting_location`.`latitude` AS `latitude`, \
        `posting_location`.`longitude` AS `longitude`, \
        `posting_location`.`location_fk` AS `location_fk`, \
        `posting_location`.`datePosted` AS `datePosted`, \
        `posting_location`.`active` AS `active`, \
        `posting_location`.`email` AS `email`, \
        `posting_location`.`url` AS `url`, \
        `prices`.`price_fk` AS `price_fk`, \
        `prices`.`price` AS `price`, \
        `prices`.`quantity` AS `quantity`, \
        `prices`.`unit` AS `unit`, \
        CASE WHEN `unit`=\'oz\' THEN `quantity`*28.3495 ELSE `quantity` END AS `quantity (grams)`, \
        SQRT( POW(`latitude`-(?),2) + POW(`longitude`-(?),2) ) AS `distance` \
      FROM `posting_location` \
        INNER JOIN `prices` ON (`posting_location`.`location_fk` = `prices`.`price_fk`) \
      WHERE `active`=1 AND `latitude` IS NOT NULL AND `longitude` IS NOT NULL AND `datePosted` IS NOT NULL AND email IS NOT NULL AND email <> \'NoEmail\' AND email <> \'Expired\') AS subquery \
    WHERE `subquery`.`price` / `subquery`.`quantity (grams)` < ? \
    AND `subquery`.`price` / `subquery`.`quantity (grams)` > ? \
    ORDER BY `datePosted` DESC, `distance` \
    LIMIT ' + MAX_EMAIL_SENT_PER_PURCHASE_ORDER;

  var connection = connectionProvider.getConnection();
  var selectSellersQuery = connection.query(sellersQuery, [
    purchaseLatitude,
    purchaseLongitude,
    highPrice,
    lowPrice],
    function(err, rows) {
      if (err) {
        console.log(err);
        /* TODO log error here */
      } else {
        if (rows.length == 0) {
          console.log('Found no seller');
        } else {
          createSellerOrders(buyerEmail, rows, purchaseOrderId, lowPrice, highPrice, quantity, deliveryDate);
        }
      }
  });

  console.log(selectSellersQuery.sql);
  connection.end();
}

function insertSaleAndCreateMessage(buyerEmail, email, seller, purchaseOrderId, lowPrice, highPrice, quantity, deliveryDate)
{
  console.log('insertSaleAndCreateMessage');

  var connection = connectionProvider.getConnection();

  var saleQuery = 'INSERT INTO sale_orders (purchaseOrderId, postingId, email) VALUES (?, ?, ?)';

  var insertSaleOrderQuery = connection.query(saleQuery, [
    purchaseOrderId.toString(),
    seller['price_fk'],
    email],
    function(err, rows) {
    if (err) {
      console.log(err);
      /* TODO log error here */
      connection.end();
      return;
    } else {
      var saleOrderId = rows['insertId'];
      createMessage(purchaseOrderId, saleOrderId, buyerEmail, email, seller['url'], lowPrice, highPrice, quantity, deliveryDate);
    }
  });

  console.log(insertSaleOrderQuery.sql);

  connection.end();
}

function createSellerOrders(buyerEmail, sellers, purchaseOrderId, lowPrice, highPrice, quantity, deliveryDate) {
  console.log('createSellerOrders');

  for (var i = 0; i < sellers.length; ++i) {
    var email = 'leafyexchange@gmail.com';
    var seller = sellers[i];
    console.log(seller);

    if (seller !== null) {
      email = seller['email'];
    } else {
      continue;
    }

    insertSaleAndCreateMessage(buyerEmail, email, seller, purchaseOrderId, lowPrice, highPrice, quantity, deliveryDate);
  }
}

function createMessage(purchaseOrderId, saleOrderId, buyerEmail, sellerEmail, sellerUrl, lowPrice, highPrice, quantity, deliveryDate) {
  console.log("createMessage");

  if (purchaseOrderId === null || purchaseOrderId === undefined ||
    saleOrderId === null || saleOrderId === undefined ||
    buyerEmail === null || buyerEmail === undefined ||
    sellerEmail === null || sellerEmail === undefined) {
    return;
  }

  console.log('Insert message');

  var hashedMessage = commonHelper.HashString(purchaseOrderId + saleOrderId + buyerEmail + sellerEmail + Math.random());
  var messageBody = "<MessageElem>A Leafy Exchanger is interested in your post!<MessageElem>Our algorithms have identified a customer that is interested in your posting {0}.<~~>The customer would like to purchase {1} grams before {2}. If you'd like to continue the exchange, click on the link below:".format(sellerUrl, quantity, deliveryDate);
  console.log(messageBody);
  console.log(sellerUrl);
  console.log(quantity);
  console.log(deliveryDate);

  // Insert the message into database to be sent
  var messageQuery = 'INSERT INTO message (purchaseOrderId, saleOrderId, messageBody, messageHTML, fromEmail, toEmail, datetime, messageHash) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)';

  var connection = connectionProvider.getConnection();
  var insertMessage = connection.query(messageQuery, [
    purchaseOrderId,
    saleOrderId,
    messageBody,
    '',
    buyerEmail,
    sellerEmail,
    hashedMessage],
    function(err, rows) {
    if (err) {
      console.log('Fail to insert into message table ' + err);
      connection.end();
      return;
    }
  });

  console.log(insertMessage.sql);
  connection.end();
}

function sendMail(messageId, sender, recipients, subject, messageBody, messageHTML, hashedMessage) {
  console.log('sendMail');

  var messageText = commonHelper.convertMessageBodyToMessageText(messageBody, hashedMessage);
  var messageHTML = commonHelper.convertMessageBodyToMessageHTML(messageBody, globals.emailTemplate, hashedMessage);

  smtpTransport.sendMail({
    from: sender,
    to: recipients,
    bcc: 'roger.l.hau@gmail.com, hungtantran@gmail.com',
    subject: subject,
    text: messageText, // plaintext body
    html: messageHTML // html body
  }, function(error, response) {
    if (error) {
      console.log('Can\'t send email');
      console.log(error);
      return;
    } else {
        var setMessageSentStatus = 'UPDATE message SET sentStatus = 1 WHERE id = ' + messageId;

        var connection2 = connectionProvider.getConnection();
        connection2.query(setMessageSentStatus, function(err, rows) {
          console.log('Finished sending message ' + messageId);
        });
        connection2.end();
    }
  });
}

function SendUnsentMessage() {
  console.log('SendUnsentMessage');

  var getUnsentMessage = 'SELECT * FROM message WHERE sentStatus = 0 ORDER BY datetime ASC LIMIT ' + MAX_MESSAGES_SENT_EACH_TIME;

  var connection = connectionProvider.getConnection();
  var getUnsentMessageQuery = connection.query(getUnsentMessage, function(err, rows) {
    if (err) {
      console.log('Can\'t query for unsent message ' + err);
      return;
    } else {
      console.log('Attempting to send ' + rows.length + ' messages.');

      for (var i = 0; i < rows.length; ++i) {
        var message = rows[i];
        var sender = 'Leafy Exchange <leafyexchange@gmail.com>';
        var recipients = message['toEmail'];
        var subject = 'Someone is interested in your posting!';

        console.log('Send message ' + message['id'] + ' from ' + sender + ' to ' + recipients + ' with subject ' + subject);

        sendMail(message['id'], sender, recipients, subject, message['messageBody'], message['messageHTML'], message['messageHash']);
      }
    }
  });

  console.log(getUnsentMessageQuery.sql);
  connection.end();
}

// Periodically process purchase order every MIN_PER_PERIODIC_PROCESS_PURCHASE_ORDER minute
setInterval(function() {
    ProcessPurchaseOrders();
}, MIN_PER_PERIODIC_PROCESS_PURCHASE_ORDER * 60000);

// Periodically sent un-sent messages every MIN_PER_PERIODIC_SENT_MESSAGE minute
setInterval(function() {
  console.log("Sending unsent messages");
  SendUnsentMessage();
}, MIN_PER_PERIODIC_SENT_MESSAGE * 60000);

exports.PeriodicProcess = PeriodicProcess;
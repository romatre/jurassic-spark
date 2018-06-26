const amqp = require("amqplib/callback_api");
const { MONGODB_URI, MONGODB_DB, RABBITMQ_HOST, QUEQUE_NAME } = require('./config')
const MongoClient = require('mongodb').MongoClient;

const getRabbitMQConnection = (cb) => new Promise((resolve, reject) => {
  amqp.connect(RABBITMQ_HOST, function (err, conn) {
    if (err)
      return reject(err)
    conn.createChannel(function(err, ch) {
      if (err)
        return reject(err)

      ch.prefetch(50);

      ch.assertExchange(QUEQUE_NAME, 'fanout', {durable: false});

      ch.assertQueue('', {exclusive: true}, function(err, q) {
        ch.bindQueue(q.queue, QUEQUE_NAME, '');

        ch.consume(q.queue, async function(msg) {
          await cb(JSON.parse(msg.content.toString()))
          ch.ack(msg);
        });

      });

    });
  })
});

const getInboundTransactionsQueque = () => new Promise((resolve, reject) => {
  amqp.connect(RABBITMQ_HOST, function (err, conn) {
    if (err)
      return reject(err)
    conn.createChannel(function(err, ch) {
      ch.assertExchange("INBOUND_TRANSACTIONS", "fanout", { durable: false });
      resolve(ch);
    });
  });
});

const getOutboundTransactionsQueque = () => new Promise((resolve, reject) => {
  amqp.connect(RABBITMQ_HOST, function (err, conn) {
    if (err)
      return reject(err)
    conn.createChannel(function(err, ch) {
      ch.assertExchange("OUTBOUND_TRANSACTIONS", "fanout", { durable: false });
      resolve(ch);
    });
  });
});

const getMongoDBConnection = () => MongoClient.connect(MONGODB_URI).then(client => client.db(MONGODB_DB));

module.exports = {
  getRabbitMQConnection,
  getMongoDBConnection,
  getInboundTransactionsQueque,
  getOutboundTransactionsQueque
};

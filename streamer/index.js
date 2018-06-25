const Web3 = require("web3");
const amqp = require("amqplib/callback_api");
const config = require("./config");
const web3 = new Web3(config.WEB3_HOST);
const MongoClient = require('mongodb').MongoClient;


amqp.connect(config.RABBITMQ_HOST, function(err, conn) {

  const TRANSACTIONS = 'transactions';
  const TRANSACTIONS_FROM = 'transactions_from';
  const TRANSACTIONS_TO = 'transactions_to';

  MongoClient.connect(config.MONGODB_URI)
    .then(async client => {
        const db = client.db(config.MONGODB_DB);
        const polling = async (channel, initialBlock) => {
          setTimeout(async () => {
            const latestBlockNumber = await web3.eth.getBlockNumber();
            for (let i = initialBlock; i <= latestBlockNumber; i++) {
              console.log(i);
              const block = await web3.eth.getBlock(i);
              const select = {
                _id: false,
                blockNumber: true,
                from: true,
                to: true,
                gas: true,
                value: true
              }
              block.transactions.forEach(async hash => {
                const { from, to, blockNumber, gas, value } = await web3.eth.getTransaction(hash)
                const tx = { from, to, blockNumber, gas, value }
                const oldTransactionsFromUser = await db.collection(TRANSACTIONS).find({
                  $or: [{ from: from },{ to: from }]
                }).project(select).toArray();
                const oldTransactionsToUser = await db.collection(TRANSACTIONS).find({
                  $or: [{ from: to },{ to: to }]
                }).project(select).toArray();
                const message_from = { address: from, transactions: [ tx, ...oldTransactionsFromUser ] }
                const message_to = { address: to, transactions: [ tx, ...oldTransactionsToUser ] }
                channel.publish(TRANSACTIONS_FROM, '', new Buffer(JSON.stringify(message_from)));
                channel.publish(TRANSACTIONS_TO, '', new Buffer(JSON.stringify(message_to)));
              });
            }
            polling(channel, latestBlockNumber + 1);
          }, 10000)
        };

        conn.createChannel(function(err, ch) {
          ch.assertExchange(TRANSACTIONS_FROM, "fanout", { durable: false });
          ch.assertExchange(TRANSACTIONS_TO, "fanout", { durable: false });
          polling(ch, config.INITIAL_BLOCK);
        });
    })

});
const Web3 = require("web3");
const amqp = require("amqplib/callback_api");
const config = require("./config");
const web3 = new Web3(config.WEB3_HOST);
const MongoClient = require('mongodb').MongoClient;



amqp.connect(config.RABBITMQ_HOST, function(err, conn) {

  const TRANSACTIONS = 'transactions';

  MongoClient.connect(config.MONGODB_URI)
    .then(async client => {
        const db = client.db(config.MONGODB_DB);
        const polling = async (channel, initialBlock) => {
          setTimeout(async () => {
            const latestBlockNumber = await web3.eth.getBlockNumber();
            for (let i = initialBlock; i <= latestBlockNumber; i++) {
              const block = await web3.eth.getBlock(i);
              console.log(i);
              block.transactions.forEach(async hash => {
                const tx = await web3.eth
                  .getTransaction(hash)
                  .then(tx => Object.assign({}, { timestamp: block.timestamp }, tx));
                const message = {
                  currentTransaction: tx,
                  oldTransactions: [
                    ...await db.collection(TRANSACTIONS).find({
                      $or: [
                        { from: tx.from },
                        { from: tx.to },
                        { to: tx.from },
                        { to: tx.to },
                      ]
                    }).toArray(),
                ]
                }
                channel.publish(TRANSACTIONS, '', new Buffer(JSON.stringify(message)));
              });
            }
            polling(channel, latestBlockNumber + 1);
          }, 10000)
        };

        conn.createChannel(function(err, ch) {
          ch.assertExchange(TRANSACTIONS, "fanout", { durable: false });
          polling(ch, config.INITIAL_BLOCK);
        });
    })

});
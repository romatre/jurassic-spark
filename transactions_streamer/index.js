const Web3 = require("web3");
const amqp = require("amqplib/callback_api");
const { QUEQUE_NAME, RABBITMQ_HOST, WEB3_HOST } = require("./config");
const web3 = new Web3(WEB3_HOST);
const services = require('./services');

services.getMongoDBConnection().then(async db => {

  const result = await db.collection('transactions').find({}).sort({blockNumber: -1}).limit(1).toArray();

  const INITIAL_BLOCK = result[0].blockNumber || 0;

  amqp.connect(RABBITMQ_HOST, function(err, conn) {

    const polling = async (channel, initialBlock, timeout = 0) => {
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
            const transaction = await web3.eth.getTransaction(hash)
            const { timestamp, blockNumber, from, to, gas, gasPrice, value } = transaction
            const tx = Object.assign({}, { hashTx: transaction.hash },
              { timestamp, blockNumber, from, to, gas, gasPrice, value })
            channel.publish(QUEQUE_NAME, '', new Buffer(JSON.stringify(tx)));
          });
        }
        polling(channel, latestBlockNumber + 1, 10000);
      }, timeout)
    };

    conn.createChannel(function(err, ch) {
      ch.assertExchange(QUEQUE_NAME, "fanout", { durable: false });
      polling(ch, INITIAL_BLOCK);
    });

  });

});
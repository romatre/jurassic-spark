const Web3 = require("web3");
const amqp = require("amqplib/callback_api");
const config = require("./config");
const web3 = new Web3(config.WEB3_HOST);

amqp.connect(config.RABBITMQ_HOST, function(err, conn) {

  const TRANSACTION = 'transaction';

  const polling = async (channel, initialBlock) => {
    setTimeout(async () => {
      const latestBlockNumber = await web3.eth.getBlockNumber();
      for (let i = initialBlock; i <= latestBlockNumber; i++) {
        const block = await web3.eth.getBlock(i);
        console.log(i);
        block.transactions.forEach(async hash => {
          const tx = await web3.eth.getTransaction(hash)
            .then(tx => Object.assign({}, { timestamp: block.timestamp }, tx));
          channel.publish(TRANSACTION, '', new Buffer(JSON.stringify(tx)));
        });
      }
      polling(channel, latestBlockNumber + 1);
    }, 10000)
  };

  conn.createChannel(function(err, ch) {
    ch.assertExchange(TRANSACTION, "fanout", { durable: false });
    polling(ch, config.INITIAL_BLOCK);
  });

});
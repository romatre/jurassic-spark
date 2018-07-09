const {
  getMongoDBConnection,
  getRabbitMQConnection,
  getInboundTransactionsQueque,
  getOutboundTransactionsQueque
} = require('./services');
const { COLLECTION_OUTPUT } = require('./config')

getMongoDBConnection().then(async db => {

  const transactions = db.collection('transactions');

  const select = { _id: 0, blockNumber: 1, from: 1, to: 1, gas: 1, value: 1 };

  const getInboundTransactionByAddress = async address => transactions.find({ to: address }).project(select).toArray();
  const getOutboundTransactionByAddress = async address => transactions.find({ from: address }).project(select).toArray();

  const inboundTransactionsQueque = await getInboundTransactionsQueque();
  const outboundTransactionsQueque = await getOutboundTransactionsQueque();

  getRabbitMQConnection(async transaction => {
    const { from, to } = transaction;
    const inboundTransactionsFromUser = {
      address: from,
      transactions: [ transaction, ...await getInboundTransactionByAddress(from) ]
    };
    const inboundTransactionsToUser = {
      address: to,
      transactions: [ transaction, ...await getInboundTransactionByAddress(to) ]
    };
    const outboundTransactionsFromUser = {
      address: from,
      transactions: [ transaction, ...await getOutboundTransactionByAddress(from) ]
    };
    const outboundTransactionsToUser = {
      address: to,
      transactions: [ transaction, ...await getOutboundTransactionByAddress(to) ]
    };
    inboundTransactionsQueque.publish("INBOUND_TRANSACTIONS", "", new Buffer(JSON.stringify(inboundTransactionsFromUser)));
    inboundTransactionsQueque.publish("INBOUND_TRANSACTIONS", "", new Buffer(JSON.stringify(inboundTransactionsToUser)));
    outboundTransactionsQueque.publish("OUTBOUND_TRANSACTIONS", "", new Buffer(JSON.stringify(outboundTransactionsFromUser)));
    outboundTransactionsQueque.publish("OUTBOUND_TRANSACTIONS", "", new Buffer(JSON.stringify(outboundTransactionsToUser)));
    console.log(new Date, from, to);
  });

})

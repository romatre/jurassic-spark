const { getMongoDBConnection, getRabbitMQConnection } = require('./services');
const Queue = require('better-queue');
const { COLLECTION_OUTPUT } = require('./config')

getMongoDBConnection().then(db => {

  const queque = new Queue(async (transactions, cb) => {
    const collection = await db.collection(COLLECTION_OUTPUT);
    const batch = collection.initializeOrderedBulkOp();
    transactions.forEach(transaction => {
      batch.find({ hashTx: transaction.hashTx }).upsert().replaceOne(transaction);
    });
    batch.execute(function(err, result) {
      cb(err);
    });
  }, { batchSize: 100, batchDelay: 5000 })

  getRabbitMQConnection(msg => queque.push(msg));

})

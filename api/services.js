const { MONGODB_URI, MONGODB_DB } = require('./config')
const MongoClient = require('mongodb').MongoClient;

const getMongoDBConnection = () => MongoClient.connect(MONGODB_URI).then(client => client.db(MONGODB_DB));

module.exports = { getMongoDBConnection };

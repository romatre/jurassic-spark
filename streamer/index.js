const { POLLING_INTERVAL, INITIAL_BLOCK } = require('./src/config')
const { web3, rabbitmq } = require('./src/lib/services')

const Stream = require('./src/lib/stream')

const stream = new Stream(web3, rabbitmq, INITIAL_BLOCK, POLLING_INTERVAL)
stream.listen()
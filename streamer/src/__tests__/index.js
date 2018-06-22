const Web3 = require('web3')
const web3 = new Web3(process.env.WEB3_HOST)
const INITIAL_BLOCK = process.env.INITIAL_BLOCK
const TRANSACTION = 'transaction'
const BLOCK = 'block'
const Promise = require('bluebird')
const amqp = Promise.promisifyAll(require('amqplib/callback_api'));

const run  = async (from, to) => {

  const conn = await amqp.connectAsync().then(Promise.promisifyAll)
  const ch = await conn.createChannelAsync().then(Promise.promisifyAll)
  ch.assertQueueAsync(TRANSACTION, { durable: false });
  ch.assertQueueAsync(BLOCK, { durable: false });

  ch.consume(TRANSACTION, msg => {
    console.log(msg.content.toString())
  }, { noAck: true })

  ch.consume(BLOCK, msg => {
    console.log(msg.content.toString())
  }, { noAck: true })

}

run()
const config = require('../config/index')
const Web3 = require('web3')
const Promise = require('bluebird')
const amqp = Promise.promisifyAll(require('amqplib/callback_api'));

module.exports = {

  web3: (() => new Promise((resolve, reject) => setTimeout(() =>
    resolve(new Web3(config.WEB3_HOST)), config.CONNECTION_TIMEOUT)
  ))(),

  rabbitmq: (async () => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(amqp.connectAsync(config.RABBITMQ_HOST).then(Promise.promisifyAll))
    }, config.CONNECTION_TIMEOUT)
  }))()

}

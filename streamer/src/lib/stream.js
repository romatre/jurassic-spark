const EventEmitter = require('events')
const Promise = require('bluebird')
const TRANSACTION = 'transaction'
const BLOCK = 'block'

class Stream {

  constructor (web3, rabbitmq, initialBlock, pollingInterval) {
    this._web3 = web3
    this._rabbitmq = rabbitmq
    this._pollingInterval = pollingInterval
    class Blockchain extends EventEmitter {}
    this._blockchain = new Blockchain()
    this._initialBlock = initialBlock
  }

  get web3 () {
    return this._web3
  }

  get rabbitmq () {
    return this._rabbitmq
  }

  get pollingInterval () {
    return this._pollingInterval
  }

  get blockchain () {
    return this._blockchain
  }

  get initialBlock () {
    return this._initialBlock
  }

  /**
   * Retrieve new blocks from blockchain.
   *
   * @param initialBlock
   * @param pollingInterval
   * @returns {Promise<void>}
   */
  async polling (initialBlock = this.initialBlock, pollingInterval = 0) {
    setTimeout(async () => {
      const web3Connection = await this.web3
      const latestBlockNumber = await web3Connection.eth.getBlockNumber()
      for (let i = initialBlock; i <= latestBlockNumber; ++i)
        this.blockchain.emit('block', i)
      this.polling(latestBlockNumber + 1, this.pollingInterval)
    }, pollingInterval)
  }

  /**
   * Push new block on rabbitmq queue.
   *
   * @returns {Promise<void>}
   */
  async stream () {
    const connection = await this.rabbitmq
    const channel = await connection.createChannelAsync().then(Promise.promisifyAll)
    channel.assertQueueAsync(TRANSACTION, { durable: false })
    channel.assertQueueAsync(BLOCK, { durable: false })

    this.blockchain.on('block', async blockNumber => {
      try {
        const web3Connection = await this.web3
        const block = await web3Connection.eth.getBlock(blockNumber)
        channel.sendToQueue(BLOCK, new Buffer(JSON.stringify(block)))
        block.transactions.forEach(async hash => {
          const tx = await web3Connection.eth
            .getTransaction(hash)
            .then(tx => Object.assign({}, {timestamp: block.timestamp}, tx))
          channel.sendToQueue(TRANSACTION, new Buffer(JSON.stringify(tx)))
        })
      } catch (error) {
        console.error(error)
      }
    })
  }

  /**
   * Polling and Stream of new blocks.
   *
   * @returns {Promise<void>}
   */
  async listen () {
    this.stream()
    this.polling()
  }

}

module.exports = Stream
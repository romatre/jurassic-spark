const Web3 = require('web3')
const fs = require('fs')
const Queue = require('better-queue')
const config = {
	host: process.env.ETH_HOST,
	begin: 0,
	end: 2879001,
	numberOfSockets: 190,
	gracePeriod: 10000
}

const queue = new Queue(function (batch, cb) {
  console.log(batch.join('\n'))
	cb()
}, { batchSize: 10000000, concurrent: 1 })

const chunk = (begin, end, numberOfChunks) => {
	const allElements = end - begin
	const maxElementsPerChunk = Math.ceil(allElements/numberOfChunks)
	if (maxElementsPerChunk === 1)
		return [ begin, end ]
	else
		return Array(numberOfChunks).fill(1).map((_, key) => {
			const A = begin + key * maxElementsPerChunk
			const candidateB = begin + (key + 1) * maxElementsPerChunk
			const B = candidateB < end ? candidateB : end
			return [ A, B ]
		})
}

const run = async ([begin, end]) => {
	let web3 = new Web3(config.host)
	for(let i = begin; i < end; ++i) {
    let error = false, transactions
    do {
      try {
      	error = false
        const block = await web3.eth.getBlock(i)
        transactions = await Promise
          .all(block.transactions.map(web3.eth.getTransaction))
          .then(txs => txs.map(tx => [tx.hash, block.timestamp, tx.blockNumber, tx.from, tx.to, tx.gas, tx.gasPrice, tx.value]))
      } catch (e) {
        error = true
		web3 = new Web3(this.host)
      }
    } while(error)
    transactions.map(tx => tx.join(',')).forEach(line => queue.push(line))
  }
}

Promise
	.all(chunk(config.begin, config.end, config.numberOfSockets).map(run))
	.then(() => setTimeout(() => process.exit(0), config.gracePeriod))

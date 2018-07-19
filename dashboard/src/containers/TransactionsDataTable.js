import React from 'react'
import JurassicSpark from '../JurassicSpark'
import TransactionsDataTableComponent from '../components/TransactionsDataTableComponent/transactionsDataTableComponent'

export default class TransactionsDataTable extends JurassicSpark {

  render() {
    const { filteredTransactions } = this.getState();
    return <TransactionsDataTableComponent transactions={filteredTransactions} />
  }

}
import React from 'react';
import BasePeriodicTransactions from "./BasePeriodicTransactions";
import JurassicSpark from '../../JurassicSpark'
require('./periodicTransactions.css');


class InboundPeriodicTransactions extends JurassicSpark {

  constructor (props) {
    super(props);
    this.api.get('periodicTransactions/inbound', null, { limit: 1000 })
      .then(transactions => this.updatedTransactions(transactions));
    this.getEmitter().addListener('update', () => {
      this.forceUpdate();
    });
  }

  render() {
    const { filteredTransactions, currentZoom } = this.getState();
    return <BasePeriodicTransactions
      title={"Inbound Periodic Transactions"}
      filteredTransactions={filteredTransactions}
      currentZoom={currentZoom}
    />
  }

}

export default InboundPeriodicTransactions;

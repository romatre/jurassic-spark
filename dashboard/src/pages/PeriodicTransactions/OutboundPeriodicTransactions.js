import React from 'react';
import JurassicSpark from "../../JurassicSpark";
import BasePeriodicTransactions from "./BasePeriodicTransactions";

class OutboundPeriodicTransactions extends JurassicSpark {

  constructor (props) {
    super(props);
    this.api.get('periodicTransactions/outbound', null, { limit: 1000 })
      .then(transactions => this.updatedTransactions(transactions));
    this.getEmitter().addListener('update', () => {
      this.forceUpdate();
    });
  }

  render() {
    const { filteredTransactions, currentZoom } = this.getState();
    return <BasePeriodicTransactions
      title={"Outbound Periodic Transactions"}
     filteredTransactions={filteredTransactions}
     currentZoom={currentZoom} />
  }
}

export default OutboundPeriodicTransactions;

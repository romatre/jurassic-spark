import React from 'react';
import storage from "./storage";
import WebAPI from "menxapi";
import config from "./config";
const {EventEmitter} = require('fbemitter');
const emitter = new EventEmitter();

export default class JurassicSpark extends React.Component {

  constructor (props) {
    super(props);
    const state = {
      transactions: [],
      filteredTransactions: [],
      currentZoom: ["value", "period"],
      filters: {
        gas: [0, 0, 0],
        value: [0, 0, 0],
        period: [0, 0, 0]
      },
    };
    this.api = new WebAPI(config.apiBaseUrl);
    this.storage = storage.setInitialState(state);
  }

  getMaxByKey(transactions, key) {
    if (transactions.length === 0)
      return 0;
    let max = transactions[0][key];
    transactions.forEach(d => {
      if (d[key] > max) {
        max = d[key];
      }
    });
    return max;
  }

  getEmitter() {
    return emitter;
  }

  getState() {
    return this.storage.state;
  }

  update(data) {
    this.storage.update(data);
    this.forceUpdate();
    this.getEmitter().emit('update');
  }

  /**
   * Update the current transactions loaded.
   *
   * @param _transactions
   */
  updatedTransactions(_transactions) {
    const parseIntOrZero = n => parseInt(n, 10) || 0;
    this.storage.update(oldState => {

      const transactions = _transactions.map(tx => Object.assign({}, tx, {
        standard_deviation: parseIntOrZero(tx.standard_deviation),
        period: parseIntOrZero(tx.period),
        number_of_blocks: parseIntOrZero(tx.number_of_blocks),
        value: parseIntOrZero(tx.value),
        gas: parseIntOrZero(tx.gas),
      }));

      const filters = {
        gas: [0, this.getMaxByKey(transactions, 'gas'), this.getMaxByKey(transactions, 'gas')],
        value: [0, this.getMaxByKey(transactions, 'value'), this.getMaxByKey(transactions, 'value')],
        period: [0, this.getMaxByKey(transactions, 'period'), this.getMaxByKey(transactions, 'period')],
      }

      return { transactions, filteredTransactions: transactions, filters };
    });
    this.forceUpdate();
    this.getEmitter().emit('update');
  }

  filterTransactionsByKey(key, _min, _max) {
    const min = parseInt(_min);
    const max = Math.ceil(parseInt(_max));
    this.storage.update(oldState => {
      const filters = Object.assign({}, oldState.filters, { [key]: [ min, max, oldState.filters[key][2] ]});
      console.log(filters);
      const filteredTransactions = oldState.transactions.filter(d => {
        return  (d.gas >= filters.gas[0] && d.gas <= filters.gas[1]) &&
                (d.value >= filters.value[0] && d.value <= filters.value[1]) &&
                (d.period >= filters.period[0] && d.period <= filters.period[1]);
      });
      return { filteredTransactions, filters };
    });
    this.forceUpdate();
    this.getEmitter().emit('update');
  }

}
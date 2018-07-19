import React from 'react';
import TransactionsDataTable from '../../containers/TransactionsDataTable';
import Page from '../../components/PageComponent/PageComponent'
import TransactionsScatterplotMatrix from '../../containers/TransactionsScatterplotMatrix'
import BigTransactionsScatterplotMatrix from '../../containers/BigTransactionsScatterPlotMatrix/BigTransactionsScatterplotMatrix'
import JurassicSpark from '../../JurassicSpark'
require('./periodicTransactions.css');

class BasePeriodicTransactions extends JurassicSpark {

  constructor (props) {
    super(props);
    this.getEmitter().addListener('update', () => {
      this.forceUpdate();
    });
  }

  onGasFilter(data) {
    const gasFilters = this.getState().filters.gas;
    if (data.target.name === 'min') {
      gasFilters[0] = data.target.value;
    } else {
      gasFilters[1] = data.target.value;
    }
    this.filterTransactionsByKey('gas', gasFilters[0], gasFilters[1]);
  }

  onValueFilter(data) {
    const valueFilters = this.getState().filters.value;
    if (data.target.name === 'min') {
      valueFilters[0] = data.target.value;
    } else {
      valueFilters[1] = data.target.value;
    }
    this.filterTransactionsByKey('value', valueFilters[0], valueFilters[1]);
  }

  onPeriodFilter(data) {
    const periodFilters = this.getState().filters.period;
    if (data.target.name === 'min') {
      periodFilters[0] = data.target.value;
    } else {
      periodFilters[1] = data.target.value;
    }
    this.filterTransactionsByKey('period', periodFilters[0], periodFilters[1]);
  }

  render() {
    const { filteredTransactions, currentZoom, title } = this.props;
    const { filters } = this.getState();
    return (
      <Page title={title}>
        <h2 className="PeriodicTransactions__title">{title}</h2>

        <div className="PeriodicTransactions__columns">
          <div>
            <TransactionsScatterplotMatrix
              gasData={filteredTransactions.map(({ gas }) => gas)}
              valueData={filteredTransactions.map(({ value }) => value)}
              periodData={filteredTransactions.map(({ period }) => period)}
              addressData={filteredTransactions.map(({ address }) => address)}
            />
          </div>
          <div>
            <div style={{ paddingTop: "20px" }}>
              <BigTransactionsScatterplotMatrix
                title={`${currentZoom[1]} / ${currentZoom[0]}`}
                width={500}
                height={400}
                infoDataPoints={filteredTransactions.map(({ address }) => address)}
                xData={filteredTransactions.map(tx => tx[currentZoom[0]])}
                yData={filteredTransactions.map(tx => tx[currentZoom[1]])} />
            </div>
          </div>
        </div>

        <div className="PeriodicTransactions__filters">
          <form onChange={this.onGasFilter.bind(this)}>
            <h4>Gas</h4>
            <input name="min" placeholder="Min gas" type="number" value={filters.gas[0]} />
            <input name="min" type="range" value={filters.gas[0]} min={0} max={filters.gas[2]} />
            <input name="max" placeholder="Max gas" type="number" value={filters.gas[1]} />
            <input name="max" type="range" value={filters.gas[1]} min={0} max={filters.gas[2]} />
          </form>
          <form onChange={this.onValueFilter.bind(this)}>
            <h4>Value</h4>
            <input name="min" placeholder="Min value" type="number" value={filters.value[0]} />
            <input name="min" type="range" value={filters.value[0]} min={0} max={filters.value[2]} />
            <input name="max" placeholder="Max value" type="number" value={filters.value[1]} />
            <input name="max" type="range" value={filters.value[1]} min={0} max={filters.value[2]} />
          </form>
          <form onChange={this.onPeriodFilter.bind(this)}>
            <h4>Period</h4>
            <input name="min" placeholder="Min period" type="number" value={filters.period[0]} />
            <input name="min" type="range" value={filters.period[0]} min={0} max={filters.period[2]} />
            <input name="max" placeholder="Max period" type="number" value={filters.period[1]} />
            <input name="max" type="range" value={filters.period[1]} min={0} max={filters.period[2]} />
          </form>
        </div>

        <TransactionsDataTable />
      </Page>
    );
  }
}

export default BasePeriodicTransactions;

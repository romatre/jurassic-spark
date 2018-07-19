import React from 'react'
import JurassicSpark from '../JurassicSpark'
import ScatterplotMatrixComponent from '../components/ScatterplotMatrixComponent/ScatterplotMatrixComponent'

export default class TransactionsScatterplotMatrix extends JurassicSpark {

  render() {
    const { gasData, valueData, periodData, addressData } = this.props;
    return <ScatterplotMatrixComponent
      infoDataPoints={addressData}
      onScatterplotClick={(xLabel, yLabel) => this.update(oldState => ({ currentZoom: [xLabel, yLabel] }))}
      data={{
        gas: {
          label: "Gas",
          data: gasData
        },
        value: {
          label: "Value",
          data: valueData
        },
        period: {
          label: "Period",
          data: periodData
        }
      }}
    />
  }

}
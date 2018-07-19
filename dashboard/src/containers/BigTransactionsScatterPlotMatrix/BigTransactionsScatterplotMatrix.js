import React from 'react'
import JurassicSpark from '../../JurassicSpark'
import Scatterplot from '../../components/Scatterplot/Scatterplot';
require('./bigTransactionsScatterPlotMatrix.css');

export default class BigTransactionsScatterplotMatrix extends JurassicSpark {

  render() {
    const { title, width, height, infoDataPoints, xData, yData } = this.props;
    return (<div className="BigTransactionsScatterPlotMatrix">
      <h3 className="BigTransactionsScatterPlotMatrix__title">{title}</h3>
      <Scatterplot
        rScale={2}
        width={width}
        height={height}
        infoDataPoints={infoDataPoints}
        xData={xData}
        yData={yData} />
    </div>)
  }

}
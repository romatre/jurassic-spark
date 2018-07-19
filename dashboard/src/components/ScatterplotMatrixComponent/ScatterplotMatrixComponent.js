import React from 'react';
import Matrix from '../MatrixComponent/MatrixComponent';
import Scatterplot from '../Scatterplot/Scatterplot';
require('./scatterplotMatrix.css');

export default (({ infoDataPoints, data, onScatterplotClick }) => {

  const widthMatrix = 500;
  const heightMatrix = 400;
  const keys = Object.keys(data);
  const labels = keys.map(key => data[key].label);
  const components = Array(keys.length).fill(1)
    .map((_, i) => Array(keys.length).fill(1).map((_, j) => {
      if (keys[i] === keys[j]) {
        return <span />
      }
      return <Scatterplot
        onClick={onScatterplotClick}
        key={`${i}-${j}`}
        width={(widthMatrix/labels.length)*0.90}
        height={heightMatrix/labels.length}
        infoDataPoints={infoDataPoints}
        xLabel={keys[i]}
        yLabel={keys[j]}
        xData={data[keys[i]].data}
        yData={data[keys[j]].data} />
    }));

  return (
    <Matrix
      width={widthMatrix}
      height={heightMatrix}
      labels={labels}
      components={components}
    />
  );

});
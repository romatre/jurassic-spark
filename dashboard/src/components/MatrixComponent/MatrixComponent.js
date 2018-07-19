import React from 'react';
require('./matrix.css');

export default (({ width = 500, height = 500, labels, components }) => {
  const length = labels.length;
  return (
    <div className="Matrix">

      <ul className="Matrix__horizontal-labels">
        {labels.map((label, key) => <li key={key} style={{ top: 0, left: `calc(1.5em + ${(width/length)*key}px)` }}>{label}</li>)}
      </ul>

      <ul className="Matrix__vertical-labels">
        {labels.reverse().map((label, key) => <li key={key} style={{ top: 0, left: `calc(${(height/length)*key}px)` }}>{label}</li>)}
      </ul>

      {Array(length).fill(1).map((_, i) =>
        <div key={i} className="Matrix__row" style={{ width }}>
          {Array(length).fill(1).map((_, j) =>
            <div key={`${i}-${j}`} className="Matrix__column" style={{ height: height / length }}>{components[i][j]}</div>
          )}
        </div>
      )}

    </div>);

});
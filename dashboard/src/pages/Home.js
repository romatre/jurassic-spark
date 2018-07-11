import React from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import Measure from 'react-measure'
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
const { ScatterPlot } = require('react-d3-components');

const columns = [
  {
    id: 'address',
    Header: 'Address',
    accessor: d => <a target="_blank" href={`https://etherscan.io/address/${d.address}`}>{d.address}</a>,
  },
  {
    id: 'standard_deviation',
    Header: 'Standard Deviation',
    accessor: d => parseInt(d.standard_deviation*100)/100,
  },
  {
    id: 'period',
    Header: 'Period',
    accessor: d => parseInt(d.period*100)/100,
  },
  {
    id: 'number_of_blocks',
    Header: 'Number of blocks',
    accessor: d => d.number_of_blocks,
  },
  {
    id: 'value',
    Header: 'Value',
    accessor: d => `${parseInt(d.value/10000000000000000)/100}`,
  },
  {
    id: 'gas',
    Header: 'Gas usage',
    accessor: d => d.gas,
  }
]

class Home extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      zoom: null,
      dimensionsZoom: {},
      std_to_filters: {
        standard_deviation: { min: 0, max: 0 },
        gas: { min: 0, max: 0 },
        value: { min: 0, max: 0 },
        period: { min: 0, max: 0 },
      },
      std_from_filters: {
        standard_deviation: { min: 0, max: 0 },
        gas: { min: 0, max: 0 },
        value: { min: 0, max: 0 },
        period: { min: 0, max: 0 },
      },
      title: 'Inbound transactions',
      otherTitle: 'Outbound transactions',
      what: 'std_to',
      data: [],
      filteredData: [],
      dimensions: {
        width: -1,
        height: -1
      }
    }
    fetch(`http://localhost:3030/${this.state.what}?limit=300`)
      .then(body => body.json())
      .then(data => this.setState({ ...this.updatedData(data) }))
  }

  updatedData(data, f) {
    const min_max = type => ({
      min: 0,
      max: Math.max(...data.map(r => r[type]))
    })
    const filters = f || {
      standard_deviation: min_max('standard_deviation'),
      gas: min_max('gas'),
      value: min_max('value'),
      period: min_max('period'),
    }
    const filteredData = data.filter(row => {
      const conditions = Object.keys(filters).map(f => row[f] >= filters[f].min && row[f] <= filters[f].max)
      return conditions.reduce((prev, curr) => prev && curr, true)
    })
    return {
      data,
      filteredData,
      [`${this.state.what}_filters`]: filters
    }
  }

  async changeWhat() {
    const what = this.state.what === 'std_to' ? 'std_from' : 'std_to'
    const title = what === 'std_to' ? 'Inbound transactions' : 'Outbound transactions'
    const otherTitle = what === 'std_to' ? 'Outbound transactions' : 'Inbound transactions'
    fetch(`http://localhost:3030/${what}?limit=1000`)
      .then(body => body.json())
      .then(data => {
        this.setState({ what, title, otherTitle })
        this.setState(this.updatedData(data))
      })
  }

  render() {
    const getData = (y, x) => {
      return {
        label: '',
        values: this.state.filteredData.map(d => ({x: d[x], y: d[y]}))
      }
    }

    const scatterplot = (
      y, x,
      width,
      height,
      margin = {top: 0, bottom: 0, left: 0, right: 0},
      rscale = 1,
      className = "scatterplot"
    ) => {
      const data = getData(y, x)
      return data &&
        data.values &&
        data.values.length > 0 &&
        <div className={className} onClick={() => this.setState({ zoom: { y, x } })}>
          <ScatterPlot
            tooltipHtml={(px, py) => <div className="tooltip"><span>{`${x}: ${px}`}</span><span>{`${y}: ${py}`}</span></div>}
            rScale={() => rscale}
            data={data}
            width={width || this.state.dimensions.width}
            height={height || this.state.dimensions.height}
            margin={margin} />
        </div>
    }

    const inputRange = (type, ) => {
      const max = Math.max(...this.state.data.map(r => r[type]))
      const value = this.state[`${this.state.what}_filters`][type]
      return <InputRange
        draggableTrack
        minValue={0}
        maxValue={Math.floor(max)}
        value={value}
        onChange={value => {
          const f = Object.assign({}, this.state[`${this.state.what}_filters`], {
            [type]: value
          })
          this.setState({
            [`${this.state.what}_filters`]: f
          })
        }}
        onChangeComplete={value => {
          const f = Object.assign({}, this.state[`${this.state.what}_filters`], {
            [type]: value
          })
          this.setState({ ...this.updatedData(this.state.data, f) })
          this.setState({
            [`${this.state.what}_filters`]: f
          })
        }} />
    }

    return (
      <div className="wrap-home">
        <div className="menu-io">
          <h1>{this.state.title}</h1>
          <span onClick={this.changeWhat.bind(this)} className="btn">{this.state.otherTitle}</span>
        </div>
        <div className="chart-info">
          <ul className="charts">
            <Measure
              bounds
              onResize={(contentRect) => {
                this.setState({ dimensions: contentRect.bounds })
              }}
            >
              {({ measureRef }) => <li ref={measureRef}></li>}
            </Measure>

            <li className="scatterplot-label">Gas</li>
            <li className="scatterplot-label">Value</li>
            <li className="scatterplot-label">Period</li>
            <li className="scatterplot-label">Gas</li>
            <li></li>
            <li>{scatterplot('gas', 'value')}</li>
            <li>{scatterplot('gas', 'period')}</li>
            <li className="scatterplot-label">Value</li>
            <li>{scatterplot('value', 'gas')}</li>
            <li></li>
            <li>{scatterplot('value', 'period')}</li>
            <li className="scatterplot-label">Period</li>
            <li>{scatterplot('period', 'gas')}</li>
            <li>{scatterplot('period', 'value')}</li>
            <li></li>
          </ul>
          <Measure
            bounds
            onResize={(contentRect) => {
              this.setState({ dimensionsZoom: contentRect.bounds })
            }}
          >
            {({ measureRef }) => <div className="scatterplot-zoom" ref={measureRef}>
              {this.state.zoom && <div>
                <h3>x: {this.state.zoom.x.split('_').join(' ')}, y: {this.state.zoom.y.split('_').join(' ')}</h3>
                {scatterplot(this.state.zoom.y, this.state.zoom.x, this.state.dimensionsZoom.width, 400, {top: 50, bottom: 5, left: 5, right: 5}, 20, '')}
              </div>}
            </div>}
          </Measure>
        </div>
        <br />
        <div className="chart-info__range">
          <h2>Ranges & Filters</h2>

          <div className="chart-info__range__line">
            <h3>Gas</h3>
            {inputRange('gas')}
          </div>

          <div className="chart-info__range__line">
            <h3>Value</h3>
            {inputRange('value')}
          </div>

          <div className="chart-info__range__line">
            <h3>Period</h3>
            {inputRange('period')}
          </div>
        </div>
        <ReactTable
          data={this.state.filteredData}
          columns={columns}
          defaultPageSize={5}
        />
      </div>
    );
  }
}

export default Home

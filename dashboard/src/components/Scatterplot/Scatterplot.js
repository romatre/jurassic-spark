import React from 'react'
const d3 = require("d3");
require('./transactionsScatterplot.css');

export default class Scatterplot extends React.Component {

  constructor (props) {
    super(props);
  }

  getData() {
    const {infoDataPoints, width, height, xData, yData, rScale} = this.props;
    let dataset = [[0, 0]];
    if (xData.length > 0) {
      dataset = xData.map((x, key) => ([x, yData[key]]));
    }
    const padding = 40;

    return { padding, infoDataPoints, width, height, dataset, rScale };
  }

  xScale(padding, width, dataset) {
    return d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d[0])*1.05])
      .range([0, width - padding]);
  }

  yScale(padding, height, dataset) {
    return d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d[1])*1.05])
      .range([height - padding, 0]);
  }

  xAxis(xScale) {
    return d3.axisBottom(xScale).ticks(3, "s")
  }

  yAxis(yScale) {
    return d3.axisLeft(yScale).ticks(3, "s")
  }

  componentDidMount() {
    const { padding, infoDataPoints, width, height, dataset, rScale } = this.getData();

    const xScale = this.xScale(padding, width, dataset);
    const yScale = this.yScale(padding, height, dataset);
    const xAxis = this.xAxis(xScale);
    const yAxis = this.yAxis(yScale);

    const svg = d3.select(this.node)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    this.setState({ svg });

    svg.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("transform", "translate(" + (padding+1) + ",0)")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", rScale || 1);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + padding + "," + (height - padding) +")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + padding +",0)")
      .call(yAxis);
  }

  componentDidUpdate() {
    const { padding, infoDataPoints, width, height, dataset, rScale } = this.getData();

    const xScale = this.xScale(padding, width, dataset);
    const yScale = this.yScale(padding, height, dataset);
    const xAxis = this.xAxis(xScale);
    const yAxis = this.yAxis(yScale);
    const svg = this.state.svg;

    const circles = svg
      .selectAll("circle")
      .data(dataset);

    circles.exit().remove();

    circles
      .enter()
      .append("circle")
      .attr("r", rScale || 1)
      .attr("transform", "translate(" + (padding+1) + ",0)")
      .merge(circles)
      .transition()
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))

    // Update X Axis
    svg.select(".x.axis")
      .transition()
      .duration(1000)
      .call(xAxis);

    // Update Y Axis
    svg.select(".y.axis")
      .transition()
      .duration(100)
      .call(yAxis);
  }

  render() {
    const { width, height, xLabel, yLabel, onClick } = this.props;
    return <svg
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={() => onClick ? onClick(xLabel, yLabel) : null}
      width={width}
      height={height}
      ref={node => this.node = node} />
  }

}
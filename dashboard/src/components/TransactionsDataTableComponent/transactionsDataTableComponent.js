import React from 'react'
import ReactTable from "react-table";
import 'react-table/react-table.css';

const getColumns = () => [
  {
    id: 'address',
    Header: 'Address',
    accessor: ({ address }) => <a target="_blank" href={`https://etherscan.io/address/${address}`}>{address}</a>,
  },
  {
    id: 'standard_deviation',
    Header: 'Standard Deviation',
    accessor: ({ standard_deviation }) => standard_deviation,
  },
  {
    id: 'period',
    Header: 'Period',
    accessor: ({ period }) => period,
  },
  {
    id: 'number_of_blocks',
    Header: 'Number of blocks',
    accessor: ({ number_of_blocks }) => number_of_blocks,
  },
  {
    id: 'value',
    Header: 'Value',
    accessor: d => d.value,
  },
  {
    id: 'gas',
    Header: 'Gas usage',
    accessor: ({ gas }) => gas,
  }
]

export default ({ transactions }) =>
  <ReactTable data={transactions} columns={getColumns()} defaultPageSize={5} />

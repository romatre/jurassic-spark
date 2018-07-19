import React from 'react';
import { Link  } from 'react-router-dom'
import Logo from "../LogoComponent/LogoComponent";
require('./menu.css');

export default () => (
  <ul id="menu">
    <div className="wrap-menu">
      <Logo />
      <li><Link to="/">Home</Link></li>
      <li><Link to="/outbound_transactions">Outbound Transactions</Link></li>
      <li><Link to="/inbound_transactions">Inbound Transactions</Link></li>
      <li><Link to="/pagerank">Pagerank</Link></li>
    </div>
  </ul>
);
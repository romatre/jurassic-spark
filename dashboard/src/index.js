import React from 'react';
import ReactDOM from 'react-dom';
import Home from './pages/Home/Home';
import OutboundPeriodicTransactions from './pages/PeriodicTransactions/OutboundPeriodicTransactions';
import InboundPeriodicTransactions from './pages/PeriodicTransactions/InboundPeriodicTransactions';
import Pagerank from './pages/Pagerank/Pagerank';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Menu from "./components/MenuComponent/menu";
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const App = () => (
  <Router>
    <div>
      <Menu />
      <Route exact path="/" component={Home}/>
      <Route exact path="/outbound_transactions" component={OutboundPeriodicTransactions}/>
      <Route exact path="/inbound_transactions" component={InboundPeriodicTransactions}/>
      <Route path="/pagerank" component={Pagerank}/>
    </div>
  </Router>
)

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import Home from './pages/Home';
import About from './pages/About';
import Topics from './pages/Topics';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const App = () => (
  <Router>
    <div>
        <ul id="menu">
          <div className="wrap-menu">
            <h1 className="logo">Jurassic<span>Spark</span></h1>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/topics">Transactions</Link></li>
            <li><Link to="/about">Team</Link></li>
          </div>
        </ul>

      <div className="wrap wrap-padding">
        <Route exact path="/" component={Home}/>
        <Route path="/topics" component={Topics}/>
        <Route path="/about" component={About}/>
      </div>
    </div>
  </Router>
)

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

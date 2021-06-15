import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker.js';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Collectibles from './pages/collectibles'
import About from "./pages/about"
import Verify from "./pages/verify"


ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path = "/" exact component={App}/>
      <Route path = "/home" component ={App}/>
      <Route path = "/collectibles" component ={Collectibles}/>
      <Route path = "/about" component ={About}/>
      <Route path = "/verify" component = {Verify}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

serviceWorker.unregister();



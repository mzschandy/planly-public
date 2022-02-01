import React from 'react';
import axios from 'axios';
import {
  BrowserRouter, Route, Redirect, Switch,
} from 'react-router-dom';

import Dashboard from './components/layout/dashboard/dashboard';
import Auth from './components/authorizatation/auth';
import Homepage from './components/homepage/homepage';
import Event from './components/events/event/event';
import Invitee from './components/invitee/invitee';

import './App.css';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

/**
 * checks to see if the the user has been authorized/logged in.
 */
const checkAuth = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  console.log(token);
  return true;
};

/**
 * private/protected route, so can only be accessed if a user passs the checkAuth() check.
 */
const PrivateRoute = ({ component: Component }, ...rest) => (
  <Route
    {...rest}
    render={(props) => (checkAuth() ? (
      <Component {...props} />
    ) : (
      <Redirect to={{ pathname: '/login' }} />
    ))}
  />
);

function App() {
  return (
    <BrowserRouter>
      {/* Navbar component */}
      <Switch>
        <Route path="/login" exact component={Auth} />
        <Route path="/" exact component={Homepage} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <PrivateRoute path="/event" component={Event} />
        <PrivateRoute path="/invitee" component={Invitee} />
        {/* <Route path="/dashboard" component={Dashboard} /> */}
      </Switch>
    </BrowserRouter>
  );
}

export default App;

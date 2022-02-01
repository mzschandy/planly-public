/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import './navigation.css';

/**
 * Used for navigation inside the app.
 */
function Navigation(props) {
  /**
   * What to display when someone is logged out.
   */
  const loggedOut = (
    <div className="d-flex">
      <Link to="/login" className="nav-link">Log In</Link>
      <Link to="/login" id="signUp" className="nav-link btn btn-primary">Sign Up</Link>
      {/*
        <ul>
          <button type="button" onClick={() => props.display_form('login')}>Login</button>
          <button type="button" onClick={() => props.display_form('signup')}>Sign up</button>
        </ul>
      */}
    </div>
  );

  const popover = (
    <Popover className="popover-basic">
      <Popover.Content>
        <Button onClick={props.handle_logout}>
          <i className="fa fa-sign-out" />
          Logout
        </Button>
      </Popover.Content>
    </Popover>
  );

  /**
   * What to display when someone is logged in.
   */
  const loggedIn = (
    <div className="d-flex">
      <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
        <div className="profile d-flex justify-content-center align-items-center">
          <div className="profile-letter">{props.profile_initial}</div>
        </div>
      </OverlayTrigger>
      {/*
        <ul>
        <button type="button" onClick={props.handle_logout}>Logout</button>
        </ul>
      */}
    </div>
  );

  const toggleNavigation = () => {
    const nav = document.getElementById('sideNav');
    const content = document.getElementById('page-content');
    if (nav.className === 'sideNav') {
      nav.className += ' responsive';
      content.className += ' responsive';
    } else {
      nav.className = 'sideNav';
      content.className = 'content';
    }
  };

  return (
    <header id={props.nav_theme}>
      <Navbar expand={false}>
        <Navbar.Brand>
          <span className="fa fa-bars menuToggle" onClick={toggleNavigation} />
          <Link to="/dashboard">
            <svg
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 489 489"
              style={{ enableBackground: 'new 0 0 489 489' }}
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path d="M0,437.825v-345.6c0-13.5,10.9-24.4,24.4-24.4h255.1h51.3l-48.7,48.7h-2.6H48.7v296.9h296.9v-53.3v-72.8l48.7-48.7v121.5
                  v77.7c0,13.4-10.9,24.4-24.4,24.4H24.4C10.9,462.225,0,451.325,0,437.825z M212.1,250.825l-52-52c-14.6-14.6-38.3-14.6-52.9,0
                  c-7.1,7.1-11,16.5-11,26.5s3.9,19.4,11,26.4l78.4,78.4c14.6,14.6,38.3,14.6,52.9,0L478,90.625c7.1-7.1,11-16.5,11-26.4
                  c0-10-3.9-19.4-11-26.5c-14.6-14.6-38.3-14.6-52.9,0L212.1,250.825z"
                  />
                </g>
              </g>
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
              <g />
            </svg>
            Plan.ly
          </Link>
        </Navbar.Brand>
        {props.logged_in ? loggedIn : loggedOut}
      </Navbar>
    </header>
  );
}
export default Navigation;

Navigation.propTypes = {
  logged_in: PropTypes.bool.isRequired,
  handle_logout: PropTypes.func.isRequired,
};

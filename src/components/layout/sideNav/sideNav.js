import React from 'react';
import { Link } from 'react-router-dom';

import './sideNav.css';

const SideNav = (props) => (
  <div id="sideNav" className="sideNav">
    <div className="menu">
      <div className={`menu-item ${props.dashboard}`}>
        <i className="fa fa-home" />
        <Link to="/dashboard">Home</Link>
      </div>
      <div className={`menu-item ${props.eventPage}`}>
        <i className="fa fa-calendar-check-o" />
        <a href="/dashboard">Events</a>
      </div>
    </div>
  </div>
);

export default SideNav;

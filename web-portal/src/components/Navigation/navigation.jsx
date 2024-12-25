import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="main-nav">
      <div className="nav-brand">Polkadot Portal</div>
      <ul className="nav-menu">
        <li>
          <NavLink to="/" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/ai-analytics">AI Analytics</NavLink>
        </li>
        <li>
          <NavLink to="/governance">Governance</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;

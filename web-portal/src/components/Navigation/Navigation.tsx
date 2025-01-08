import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="main-nav">
      <div className="nav-brand">Bulldroid Portal</div>
      <ul className="nav-menu">
        <li>
          <NavLink to="/">Bulldroid</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 
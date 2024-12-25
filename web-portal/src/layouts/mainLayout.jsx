import React from 'react';
import Navigation from '../components/Navigation/Navigation';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="content-container">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;

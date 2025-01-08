import React, { ReactNode } from 'react';
import Navigation from '../components/Navigation/Navigation';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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

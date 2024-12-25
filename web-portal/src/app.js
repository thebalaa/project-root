import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AIAnalytics from './pages/AIAnalytics';
import Governance from './pages/Governance';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai-analytics" element={<AIAnalytics />} />
        <Route path="/governance" element={<Governance />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

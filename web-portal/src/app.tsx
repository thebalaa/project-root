import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import BulldroidLanding from './pages/BulldroidLanding/BulldroidLanding';
import Governance from './pages/Governance/Governance';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<BulldroidLanding />} />
        <Route path="/governance" element={<Governance />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

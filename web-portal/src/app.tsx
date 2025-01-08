import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import BulldroidLanding from './pages/BulldroidLanding/BulldroidLanding';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<BulldroidLanding />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

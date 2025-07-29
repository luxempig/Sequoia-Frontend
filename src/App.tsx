import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage     from './components/HomePage';
import VoyageDetail from './components/VoyageDetail';
import './index.css';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"            element={<HomePage />} />
      <Route path="/voyages/:id" element={<VoyageDetail />} />
    </Routes>
  </BrowserRouter>
);

export default App;

// File: src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage     from './components/HomePage';
import VoyageList   from './components/VoyageList';
import VoyageDetail from './components/VoyageDetail';
import './index.css';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<HomePage />} />

      {/* Full voyage timeline list */}
      <Route path="/voyages" element={<VoyageList />} />

      {/* Individual voyage detail */}
      <Route path="/voyages/:id" element={<VoyageDetail />} />
    </Routes>
  </BrowserRouter>
);

export default App;

// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VoyageList   from './components/VoyageList';    // your pre-auth list
import VoyageDetail from './components/VoyageDetail';  // your detail view
import './index.css';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"          element={<VoyageList   />} />
      <Route path="/voyages/:id" element={<VoyageDetail />} />
    </Routes>
  </BrowserRouter>
);

export default App;

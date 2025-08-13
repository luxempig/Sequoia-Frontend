import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./components/HomePage";
import VoyageList from "./components/VoyageList";
import VoyageDetail from "./components/VoyageDetail";
import PresidentDirectory from "./components/PresidentDirectory";
import PresidentVoyages from "./components/PresidentVoyages";
import "./index.css";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/voyages" element={<VoyageList />} />
      <Route path="/voyages/:id" element={<VoyageDetail />} />

      {/* NEW: presidents directory + detail */}
      <Route path="/presidents" element={<PresidentDirectory />} />
      <Route path="/presidents/:id" element={<PresidentVoyages />} />
    </Routes>
  </BrowserRouter>
);

export default App;

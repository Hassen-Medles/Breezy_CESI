// frontend/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnexionPage from './pages/connexion/connexion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/connexion" element={<ConnexionPage />} />
      </Routes>
    </Router>
  );
}

export default App;

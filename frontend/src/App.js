import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ClientForm from './ClientForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Public Client Form route */}
        <Route path="/form" element={<ClientForm />} />

        {/* Redirect all other paths to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;

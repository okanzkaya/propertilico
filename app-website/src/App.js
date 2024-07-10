import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* Add other routes here */}
      </Routes>
    </div>
  );
};

export default App;

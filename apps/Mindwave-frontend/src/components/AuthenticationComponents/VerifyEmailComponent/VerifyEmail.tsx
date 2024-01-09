import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import VerifyEmail from './VerifyEmail';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          {/* Add more Routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Hero from './Hero';
import ImageEditor from './page/ManageCertificate';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/manage-certificate" element={<ImageEditor />} />
    </Routes>
  );
}

export default App;

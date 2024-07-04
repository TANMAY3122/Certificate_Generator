// src/Hero.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/manage-certificate');
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">Dynamic Certificate Generator</h1>
      <p className="text-xl mb-8">Easily create and customize your certificates</p>
      <p className="text-xl mb-8">Save time and effort with our automated system</p>
      <div className="flex space-x-4">
        <button 
          className="bg-white text-black py-2 px-4 rounded hover:bg-gray-200" 
          onClick={handleGetStartedClick}
        >
          Get Started
        </button>
        <button className="bg-white text-black py-2 px-4 rounded hover:bg-gray-200">Learn More</button>
      </div>
    </div>
  );
}

export default Hero;

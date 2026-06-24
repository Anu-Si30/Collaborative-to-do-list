import React from 'react';
import './Spinner.css';

const Spinner = ({ fullScreen = false }) => {
  return (
    <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner;

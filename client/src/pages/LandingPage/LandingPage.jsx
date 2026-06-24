import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">
          Neon <span className="highlight">Tasks</span>
        </h1>
        <p className="landing-subtitle">
          Collaborative To-Do lists in real-time. Join a lobby, pick your color, and get things done together.
        </p>
        
        <div className="auth-container">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${showLogin ? 'active' : ''}`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${!showLogin ? 'active' : ''}`}
              onClick={() => setShowLogin(false)}
            >
              Register
            </button>
          </div>
          
          <div className="auth-form-wrapper">
            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
      
      <div className="decorative-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { register as registerService } from '../../services/authService';
import Toast from '../Shared/Toast';
import './RegisterForm.css';

const NEON_COLORS = [
  { name: 'Blue', value: '#00d4ff' },
  { name: 'Pink', value: '#ff00ff' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Purple', value: '#b200ff' }
];

const RegisterForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    color: '#00d4ff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (colorValue) => {
    setFormData({ ...formData, color: colorValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const data = await registerService(formData);
      login(data.token, data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Choose a username"
          minLength="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Create a password"
          minLength="8"
        />
      </div>

      <div className="form-group">
        <label htmlFor="passwordConfirm">Confirm Password</label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
          minLength="8"
        />
      </div>

      <div className="form-group">
        <label>Pick your Neon Color</label>
        <div className="color-picker">
          {NEON_COLORS.map(color => (
            <button
              key={color.value}
              type="button"
              className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
              style={{ 
                backgroundColor: color.value,
                boxShadow: formData.color === color.value ? `0 0 15px ${color.value}` : 'none'
              }}
              onClick={() => handleColorSelect(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        className={`btn btn-primary submit-btn ${loading ? 'btn-disabled' : ''}`}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;

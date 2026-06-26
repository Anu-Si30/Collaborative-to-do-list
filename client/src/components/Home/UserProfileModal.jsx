import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { useAuth } from '../../context/AuthContext';
import { updateUserColor } from '../../services/userService';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser, logout } = useAuth();
  const [color, setColor] = useState(user?.color || '#00d4ff');
  const [isSaving, setIsSaving] = useState(false);

  // Sync color state if user context updates
  useEffect(() => {
    if (user?.color) {
      setColor(user.color);
    }
  }, [user]);

  if (!user) return null;

  const handleColorUpdate = async () => {
    if (color === user.color) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserColor(color);
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update color', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="profile-content">
        <div className="profile-avatar-large" style={{ borderColor: color }}>
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="profile-username" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
          {user?.username}
        </h2>
        <p className="profile-email">{user?.email}</p>
        
        <div className="profile-color-picker">
          <label htmlFor="userColor">Choose your color:</label>
          <div className="color-input-wrapper">
            <input 
              type="color" 
              id="userColor" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              disabled={isSaving}
            />
            {color !== user.color && (
              <button 
                className="btn-update-color" 
                onClick={handleColorUpdate}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Color'}
              </button>
            )}
          </div>
        </div>
        
        <button className="btn profile-logout-btn" onClick={() => { onClose(); logout(); }}>
          Logout
        </button>
      </div>
    </Modal>
  );
};

export default UserProfileModal;

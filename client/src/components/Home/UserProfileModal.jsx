import React from 'react';
import Modal from '../Shared/Modal';
import { useAuth } from '../../context/AuthContext';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="profile-content">
        <div className="profile-avatar-large" style={{ borderColor: user?.color }}>
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="profile-username" style={{ color: user?.color, textShadow: `0 0 10px ${user?.color}` }}>
          {user?.username}
        </h2>
        <p className="profile-email">{user?.email}</p>
        
        <button className="btn profile-logout-btn" onClick={() => { onClose(); logout(); }}>
          Logout
        </button>
      </div>
    </Modal>
  );
};

export default UserProfileModal;

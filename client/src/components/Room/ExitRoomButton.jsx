import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveRoom } from '../../services/roomService';
import DeleteConfirmModal from './DeleteConfirmModal';
import './ExitRoomButton.css';

const ExitRoomButton = ({ roomId }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    setLoading(true);
    try {
      await leaveRoom(roomId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to leave room:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <button className="exit-room-btn" onClick={() => setShowConfirm(true)} title="Leave Room">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <DeleteConfirmModal 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLeave}
        loading={loading}
        title="Leave Room"
        message="Are you sure you want to leave this room? You will need the room code to join back."
      />
    </>
  );
};

export default ExitRoomButton;

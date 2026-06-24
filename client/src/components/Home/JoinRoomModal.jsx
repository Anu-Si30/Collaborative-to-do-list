import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { joinRoom } from '../../services/roomService';
import Toast from '../Shared/Toast';
import './JoinRoomModal.css';

const JoinRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await joinRoom(roomCode);
      setRoomCode('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Room">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <Toast message={error} type="error" onClose={() => setError('')} />}
        
        <div className="form-group">
          <label>Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            placeholder="Enter 6-character code"
            maxLength={6}
            style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          />
        </div>
        
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;

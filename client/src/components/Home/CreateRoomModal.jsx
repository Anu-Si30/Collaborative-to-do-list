import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { createRoom } from '../../services/roomService';
import { getFriends } from '../../services/userService';
import Toast from '../Shared/Toast';
import './CreateRoomModal.css';

const CreateRoomModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', description: '', invitedFriends: [] });
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setFormData({ name: '', description: '', invitedFriends: [] });
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const data = await getFriends();
      setFriends(data?.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends', err);
    }
  };

  const handleToggleFriend = (friendId) => {
    setFormData(prev => {
      const isInvited = prev.invitedFriends.includes(friendId);
      if (isInvited) {
        return { ...prev, invitedFriends: prev.invitedFriends.filter(id => id !== friendId) };
      } else {
        return { ...prev, invitedFriends: [...prev.invitedFriends, friendId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createRoom(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Room">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <Toast message={error} type="error" onClose={() => setError('')} />}
        
        <div className="form-group">
          <label>Room Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="E.g., Team Project"
          />
        </div>
        
        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this room for?"
            rows={2}
          />
        </div>

        {friends.length > 0 && (
          <div className="form-group friends-invite-group">
            <label>Invite Friends (Optional)</label>
            <div className="friends-checklist">
              {friends.map(friend => (
                <label key={friend._id} className="friend-check-item">
                  <input
                    type="checkbox"
                    checked={formData.invitedFriends.includes(friend._id)}
                    onChange={() => handleToggleFriend(friend._id)}
                  />
                  <div className="mini-avatar" style={{ borderColor: friend.color, width: '24px', height: '24px', fontSize: '0.8rem' }}>
                    {friend?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <span>{friend.username}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;

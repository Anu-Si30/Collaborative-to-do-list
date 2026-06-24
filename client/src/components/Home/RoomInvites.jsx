import React, { useState, useEffect } from 'react';
import { getRoomInvites, acceptRoomInvite, rejectRoomInvite } from '../../services/userService';
import Toast from '../Shared/Toast';
import './PendingRequests.css'; // Reuse pending requests styling

const RoomInvites = ({ onActionCompleted, onRoomsChanged }) => {
  const [invites, setInvites] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const data = await getRoomInvites();
      setInvites(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (roomId) => {
    try {
      await acceptRoomInvite(roomId);
      setToastMsg('Joined room successfully!');
      setInvites(invites.filter(inv => inv._id !== roomId));
      if (onActionCompleted) onActionCompleted();
      if (onRoomsChanged) onRoomsChanged(); // refresh the rooms list on HomePage
    } catch (err) {
      setToastMsg('Failed to accept invite');
    }
  };

  const handleReject = async (roomId) => {
    try {
      await rejectRoomInvite(roomId);
      setInvites(invites.filter(inv => inv._id !== roomId));
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setToastMsg('Failed to reject invite');
    }
  };

  if (invites.length === 0) return null;

  return (
    <div className="pending-requests">
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}
      <h4>Room Invitations</h4>
      {invites.map(room => (
        <div key={room._id} className="request-item">
          <div className="invite-info">
            <strong>{room.name}</strong>
            <span style={{fontSize: '0.8rem', color: '#aaa', display: 'block'}}>Invited by {room.owner?.username}</span>
          </div>
          <div className="invite-actions" style={{display: 'flex', gap: '0.5rem'}}>
            <button className="btn btn-primary btn-small" onClick={() => handleAccept(room._id)}>Join</button>
            <button className="btn btn-small" onClick={() => handleReject(room._id)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomInvites;

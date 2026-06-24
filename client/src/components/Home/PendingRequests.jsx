import React, { useState, useEffect } from 'react';
import { getFriends, acceptFriendRequest } from '../../services/userService';
import Toast from '../Shared/Toast';
import './PendingRequests.css';

const PendingRequests = ({ onAccept }) => {
  const [requests, setRequests] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getFriends();
      setRequests(data?.friendRequests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptFriendRequest(userId);
      setToastMsg('Friend request accepted!');
      setRequests(requests.filter(req => req._id !== userId));
      if (onAccept) onAccept();
    } catch (err) {
      setToastMsg('Failed to accept request');
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="pending-requests">
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}
      <h4>Pending Requests</h4>
      {requests.map(req => (
        <div key={req._id} className="request-item">
          <span>{req.username}</span>
          <button className="btn btn-primary" onClick={() => handleAccept(req._id)}>Accept</button>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests;

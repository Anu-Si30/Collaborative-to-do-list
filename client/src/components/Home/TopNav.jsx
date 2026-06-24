import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getFriends, getRoomInvites } from '../../services/userService';
import UserProfileModal from './UserProfileModal';
import FriendsList from './FriendsList';
import Toast from '../Shared/Toast';
import './TopNav.css';

const TopNav = ({ onRoomsChanged }) => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [showProfile, setShowProfile] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCounts = async () => {
    try {
      const [friendsData, invitesData] = await Promise.all([
        getFriends(),
        getRoomInvites()
      ]);
      const friendReqs = friendsData?.friendRequests?.length || 0;
      const roomReqs = invitesData?.length || 0;
      setPendingCount(friendReqs + roomReqs);
    } catch (err) {
      console.error('Failed to fetch pending counts', err);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('friend-request', ({ from }) => {
      setToastMessage(`New friend request from ${from}`);
      setPendingCount(prev => prev + 1);
    });

    socket.on('room-invite', (room) => {
      setToastMessage(`You were invited to room: ${room.name}`);
      setPendingCount(prev => prev + 1);
    });

    return () => {
      socket.off('friend-request');
      socket.off('room-invite');
    };
  }, [socket]);

  return (
    <nav className="top-nav">
      {toastMessage && <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />}
      <div className="nav-brand">
        Neon <span className="highlight">Tasks</span>
      </div>
      
      <div className="nav-items">
        <button className="nav-btn friends-btn" onClick={() => setShowFriends(!showFriends)}>
          Friends
          {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
        </button>
        <div 
          className="user-avatar" 
          style={{ borderColor: user?.color }}
          onClick={() => setShowProfile(true)}
        >
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      {showProfile && <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />}
      {showFriends && <FriendsList onClose={() => setShowFriends(false)} onActionCompleted={fetchPendingCounts} onRoomsChanged={onRoomsChanged} />}
    </nav>
  );
};

export default TopNav;

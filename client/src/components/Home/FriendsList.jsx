import React, { useState, useEffect } from 'react';
import { getFriends, removeFriend } from '../../services/userService';
import Modal from '../Shared/Modal';
import SearchBar from './SearchBar';
import PendingRequests from './PendingRequests';
import RoomInvites from './RoomInvites';
import Toast from '../Shared/Toast';
import './FriendsList.css';

const FriendsList = ({ onClose, onActionCompleted, onRoomsChanged }) => {
  const [friends, setFriends] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await getFriends();
      setFriends(data?.friends || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (friendId) => {
    try {
      await removeFriend(friendId);
      setToastMsg('Friend removed');
      fetchFriends();
    } catch (err) {
      setToastMsg('Failed to remove friend');
    }
  };

  const handleActionCompleted = () => {
    fetchFriends();
    if (onActionCompleted) onActionCompleted();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Friends">
      <div className="friends-container">
        {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}
        
        <SearchBar />
        <RoomInvites onActionCompleted={handleActionCompleted} onRoomsChanged={onRoomsChanged} />
        <PendingRequests onAccept={handleActionCompleted} />

        <div className="friends-list">
          <h4>Your Friends ({friends.length})</h4>
          {friends.length === 0 ? (
            <p className="empty-state">You don't have any friends yet.</p>
          ) : (
            friends.map(friend => (
              <div key={friend._id} className="friend-item">
                <div className="friend-info">
                  <div className="mini-avatar" style={{ borderColor: friend.color }}>
                    {friend?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <span>{friend.username}</span>
                </div>
                <button className="btn btn-small btn-danger" onClick={() => handleRemove(friend._id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FriendsList;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyRooms } from '../../services/roomService';
import TopNav from '../../components/Home/TopNav';
import RoomCard from '../../components/Home/RoomCard';
import CreateRoomModal from '../../components/Home/CreateRoomModal';
import JoinRoomModal from '../../components/Home/JoinRoomModal';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getMyRooms();
      // Backend returns array directly: res.json(rooms)
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchRooms error:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <TopNav onRoomsChanged={fetchRooms} />
      
      <main className="home-main">
        <header className="home-header">
          <h2>My Rooms</h2>
          <div className="home-actions">
            <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>
              Join Room
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Room
            </button>
          </div>
        </header>

        {loading ? (
          <div className="loading">Loading rooms...</div>
        ) : (
          <div className="room-grid">
            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>You don't have any rooms yet. Create or join one!</p>
              </div>
            ) : (
              rooms.map(room => (
                <RoomCard key={room._id} room={room} />
              ))
            )}
          </div>
        )}
      </main>

      <CreateRoomModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={fetchRooms}
      />
      <JoinRoomModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
        onSuccess={fetchRooms}
      />
    </div>
  );
};

export default HomePage;

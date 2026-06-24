import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomCard.css';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();

  return (
    <div className="room-card" onClick={() => navigate(`/room/${room._id}`)}>
      <div className="room-card-header">
        <h3>{room.name}</h3>
        <span className="room-code">Code: {room.code}</span>
      </div>
      <p className="room-desc">{room.description || 'No description'}</p>
      <div className="room-footer">
        <span className="member-count">
          {room.members?.length ?? 0} member{(room.members?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default RoomCard;

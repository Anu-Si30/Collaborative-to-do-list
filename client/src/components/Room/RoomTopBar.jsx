import React from 'react';
import { useNavigate } from 'react-router-dom';
import DateTimeDisplay from './DateTimeDisplay';
import ExitRoomButton from './ExitRoomButton';
import './RoomTopBar.css';

const RoomTopBar = ({ room }) => {
  const navigate = useNavigate();

  return (
    <header className="room-top-bar">
      <div className="top-bar-left">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          &larr;
        </button>
        <div className="room-info">
          <h2>{room.name}</h2>
          <span className="room-code-badge">Code: {room.code}</span>
        </div>
      </div>

      <div className="top-bar-center">
        <DateTimeDisplay />
      </div>

      <div className="top-bar-right">
        <div className="members-avatars">
          {room?.members?.map((member, idx) => (
            <div 
              key={member._id} 
              className="mini-avatar" 
              style={{ borderColor: member.color, zIndex: 10 - idx }}
              title={member.username}
            >
              {member?.username?.charAt(0)?.toUpperCase()}
            </div>
          ))}
        </div>
        <ExitRoomButton roomId={room._id} />
      </div>
    </header>
  );
};

export default RoomTopBar;

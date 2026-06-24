import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getRoom } from '../../services/roomService';
import RoomTopBar from '../../components/Room/RoomTopBar';
import TodoBoard from '../../components/Room/TodoBoard';
import Spinner from '../../components/Shared/Spinner';
import Toast from '../../components/Shared/Toast';
import './RoomPage.css';

const RoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.emit('join-room', id);

    const handleMemberJoined = ({ user: joinedUser }) => {
      setToastMessage(`${joinedUser.username} joined the room! 🎉`);
      setRoom((prev) => {
        // Avoid duplicate if they were somehow already in the list
        const filtered = prev.members.filter(
          (m) => m._id?.toString() !== joinedUser._id?.toString()
        );
        return { ...prev, members: [...filtered, joinedUser] };
      });
    };

    const handleMemberLeft = ({ userId, username }) => {
      setToastMessage(`${username} left the room.`);
      setRoom((prev) => ({
        ...prev,
        members: prev.members.filter(
          (m) => m._id?.toString() !== userId?.toString()
        ),
      }));
    };

    socket.on('member-joined', handleMemberJoined);
    socket.on('member-left', handleMemberLeft);

    return () => {
      socket.emit('leave-room', id);
      socket.off('member-joined', handleMemberJoined);
      socket.off('member-left', handleMemberLeft);
    };
  }, [socket, id, room?._id]);

  const fetchRoom = async () => {
    try {
      const data = await getRoom(id);
      // Backend returns room object directly
      setRoom(data);
    } catch (err) {
      console.error('fetchRoom error:', err);
      setError('Failed to load room or you are not a member.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner fullScreen />;
  if (error || !room) return <div className="room-error">{error || 'Room not found'}</div>;

  return (
    <div className="room-page">
      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}
      <RoomTopBar room={room} />
      <TodoBoard roomId={id} members={room.members || []} />
    </div>
  );
};

export default RoomPage;

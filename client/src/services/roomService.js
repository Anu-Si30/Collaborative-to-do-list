import api from './api';

// GET /api/rooms — all rooms the current user is in
export const getMyRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

// POST /api/rooms — create a room
export const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data;
};

// POST /api/rooms/join — join by 6-digit code sent in body
export const joinRoom = async (roomCode) => {
  const response = await api.post('/rooms/join', { code: roomCode.toString() });
  return response.data;
};

// GET /api/rooms/id/:id — get room by MongoDB _id (used when clicking a room card)
export const getRoom = async (roomId) => {
  const response = await api.get(`/rooms/id/${roomId}`);
  return response.data;
};

// POST /api/rooms/:id/leave
export const leaveRoom = async (roomId) => {
  const response = await api.post(`/rooms/${roomId}/leave`);
  return response.data;
};

// DELETE /api/rooms/:id  (creator only)
export const deleteRoom = async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};

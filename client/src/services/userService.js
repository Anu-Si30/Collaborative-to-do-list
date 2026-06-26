import api from './api';

// Search all users by username
export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
  return response.data; // returns array directly
};

// Send friend request — backend expects { targetUserId } in body
export const sendFriendRequest = async (userId) => {
  const response = await api.post('/users/friend-request', { targetUserId: userId });
  return response.data;
};

// Accept friend request — backend expects { requesterId } in body
export const acceptFriendRequest = async (userId) => {
  const response = await api.post('/users/friend-request/accept', { requesterId: userId });
  return response.data;
};

// Reject friend request — backend expects { requesterId } in body
export const rejectFriendRequest = async (userId) => {
  const response = await api.post('/users/friend-request/reject', { requesterId: userId });
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/users/friends');
  return response.data; // { friends: [], friendRequests: [] }
};

export const removeFriend = async (friendId) => {
  const response = await api.delete(`/users/friend/${friendId}`);
  return response.data;
};

export const getRoomInvites = async () => {
  const response = await api.get('/users/room-invites');
  return response.data;
};

export const acceptRoomInvite = async (roomId) => {
  const response = await api.post('/users/room-invites/accept', { roomId });
  return response.data;
};

export const rejectRoomInvite = async (roomId) => {
  const response = await api.post('/users/room-invites/reject', { roomId });
  return response.data;
};

export const updateUserColor = async (color) => {
  const response = await api.put('/users/color', { color });
  return response.data;
};

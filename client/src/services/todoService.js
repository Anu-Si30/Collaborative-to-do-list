import api from './api';

// GET all todos in a room
export const getTodosByRoom = async (roomId) => {
  const response = await api.get(`/todos/room/${roomId}`);
  return response.data;
};

// POST — create todo in multiple rooms at once
// body: { text, date, roomIds: ['id1','id2'] }
export const createTodo = async ({ text, date, roomIds }) => {
  const response = await api.post('/todos', { text, date, roomIds });
  return response.data;
};

// PATCH — toggle completed on a single todo
export const toggleTodo = async (todoId) => {
  const response = await api.patch(`/todos/${todoId}/toggle`);
  return response.data;
};

// PUT — edit text on a single todo (and its synced copies)
export const editTodo = async (todoId, text) => {
  const response = await api.put(`/todos/${todoId}`, { text });
  return response.data;
};

// DELETE — remove todo (optionally from all linked rooms)
export const deleteTodo = async (todoId, deleteAll = false) => {
  const response = await api.delete(`/todos/${todoId}${deleteAll ? '?all=true' : ''}`);
  return response.data;
};

// GET user's rooms (for the multi-room picker in AddTodoModal)
export const getMyRoomsForPicker = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

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

// DELETE — remove todo (optionally from specific rooms)
export const deleteTodo = async (todoId, roomIds = null) => {
  const response = await api.delete(`/todos/${todoId}`, {
    data: roomIds ? { roomIds } : {},
  });
  return response.data;
};

// GET user's rooms (for the multi-room picker in AddTodoModal)
export const getMyRoomsForPicker = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

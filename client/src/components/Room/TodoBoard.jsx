import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getTodosByRoom } from '../../services/todoService';
import UserTodoCard from './UserTodoCard';
import './TodoBoard.css';

const getGridCols = (count) => {
  if (count === 1) return '1';
  if (count === 2) return '2';
  if (count <= 4) return '2';
  if (count <= 6) return '3';
  if (count <= 9) return '3';
  return null; // 10+ → horizontal scroll via CSS
};

const TodoBoard = ({ roomId, members = [] }) => {
  const { user: currentUser } = useAuth();
  const socket = useSocket();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleAdded = (newTodo) => {
      const rid = newTodo.room?._id || newTodo.room;
      if (rid?.toString() === roomId?.toString()) {
        setTodos((prev) => [...prev, newTodo]);
      }
    };

    const handleToggled = (updatedTodo) => {
      setTodos((prev) =>
        prev.map((t) =>
          t._id?.toString() === updatedTodo._id?.toString() ? updatedTodo : t
        )
      );
    };

    const handleDeleted = ({ todoId }) => {
      setTodos((prev) => prev.filter((t) => t._id !== todoId));
    };

    socket.on('todo-added', handleAdded);
    socket.on('todo-toggled', handleToggled);
    socket.on('todo-deleted', handleDeleted);

    return () => {
      socket.off('todo-added', handleAdded);
      socket.off('todo-toggled', handleToggled);
      socket.off('todo-deleted', handleDeleted);
    };
  }, [socket, roomId]);

  const fetchTodos = async () => {
    try {
      const data = await getTodosByRoom(roomId);
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="board-loading">Loading tasks…</div>;

  const count = members.length;
  const cols = getGridCols(count);
  // 10+ members: switch to horizontal flex scroll
  const isScrollMode = count > 9;

  return (
    <main className="todo-board">
      <div
        className={`users-grid ${isScrollMode ? 'users-grid--scroll' : ''}`}
        style={cols && !isScrollMode ? { '--grid-cols': cols } : {}}
      >
        {members.map((member) => {
          const memberTodos = todos.filter(
            (t) => (t.owner?._id || t.owner)?.toString() === member._id?.toString()
          );
          const isOwn = member._id?.toString() === currentUser?._id?.toString();

          return (
            <UserTodoCard
              key={member._id}
              user={member}
              todos={memberTodos}
              roomId={roomId}
              isOwn={isOwn}
              onTodoAdded={fetchTodos}
            />
          );
        })}
      </div>
    </main>
  );
};

export default TodoBoard;

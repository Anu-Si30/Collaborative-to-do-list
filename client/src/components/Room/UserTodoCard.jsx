import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import AddTodoModal from './AddTodoModal';
import './UserTodoCard.css';

const formatDateHeader = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st'
    : day % 10 === 2 && day !== 12 ? 'nd'
    : day % 10 === 3 && day !== 13 ? 'rd'
    : 'th';
  return `${day}${suffix} ${month}`;
};

const groupByDate = (todos) => {
  const groups = {};
  todos.forEach((todo) => {
    let key;
    try {
      if (!todo.date) throw new Error('No date');
      key = new Date(todo.date).toISOString().split('T')[0];
    } catch (e) {
      key = new Date().toISOString().split('T')[0]; // Fallback to today if old task has no date
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(todo);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
};

const UserTodoCard = ({ user, todos, roomId, isOwn, onTodoAdded }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Track completed state locally so the progress ring updates INSTANTLY
  // when a checkbox is clicked, without waiting for the socket round-trip.
  const [completedIds, setCompletedIds] = useState(
    () => new Set(todos.filter((t) => t.completed).map((t) => t._id?.toString()))
  );

  // Re-sync when the todos prop changes (e.g. socket update, initial load)
  useEffect(() => {
    setCompletedIds(
      new Set(todos.filter((t) => t.completed).map((t) => t._id?.toString()))
    );
  }, [todos]);

  // Called by TodoItem when the user clicks the checkbox
  const handleTodoToggle = (todoId, newCompleted) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (newCompleted) next.add(todoId?.toString());
      else next.delete(todoId?.toString());
      return next;
    });
  };

  const total = todos.length;
  const completed = completedIds.size;

  // SVG circular progress
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;
  const strokeDashoffset = circumference * (1 - progress);

  const dateGroups = groupByDate(todos);

  return (
    <>
      <div
        className="user-todo-card"
        style={{ '--user-color': user.color, borderColor: user.color }}
      >
        {/* Header: NAME on left, progress ring on right */}
        <div className="card-header">
          <span className="card-username" style={{ color: user?.color }}>
            {user?.username?.toUpperCase()}
          </span>

          <div className="progress-ring-wrap" title={`${completed}/${total} tasks done`}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              {/* Track */}
              <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              {/* Progress arc */}
              <circle
                cx="20" cy="20" r={radius}
                fill="none"
                stroke={user?.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 20 20)"
                style={{
                  transition: 'stroke-dashoffset 0.4s ease',
                  filter: `drop-shadow(0 0 4px ${user?.color})`,
                }}
              />
              {/* Initials */}
              <text
                x="20" y="20"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fontWeight="700"
                fill={user?.color}
                fontFamily="Inter, sans-serif"
              >
                {user?.username?.slice(0, 2)?.toUpperCase()}
              </text>
            </svg>
          </div>
        </div>

        <div className="card-divider" style={{ background: user?.color }} />

        {/* Todo list grouped by date */}
        <div className="todo-list">
          {dateGroups.length === 0 ? (
            <p className="empty-state">No tasks yet.</p>
          ) : (
            dateGroups.map(([dateKey, dateTodos]) => (
              <div key={dateKey} className="date-group">
                <div className="date-header">{formatDateHeader(dateKey)}</div>
                {dateTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    userColor={user.color}
                    isOwn={isOwn}
                    roomId={roomId}
                    onToggle={handleTodoToggle}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {isOwn && (
          <button
            className="add-task-btn"
            style={{ borderColor: user.color, color: user.color }}
            onClick={() => setShowAddModal(true)}
          >
            + Add Task
          </button>
        )}
      </div>

      {isOwn && (
        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          currentRoomId={roomId}
          onAdded={onTodoAdded}
        />
      )}
    </>
  );
};

export default UserTodoCard;

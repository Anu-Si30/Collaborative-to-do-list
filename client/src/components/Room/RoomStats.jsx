import React, { useState, useEffect } from 'react';
import { getTodosByRoom } from '../../services/todoService';
import './RoomStats.css';

const RoomStats = ({ roomId }) => {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getTodosByRoom(roomId);
        const todos = data.data.todos;
        const comp = todos.filter(t => t.isCompleted).length;
        setTotal(todos.length);
        setCompleted(comp);
        setProgress(todos.length === 0 ? 0 : (comp / todos.length) * 100);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [roomId]);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="room-stats">
      <div className="stats-text">
        <span className="stats-completed">{completed}</span>
        <span className="stats-total">/{total}</span>
      </div>
      <svg className="progress-ring" width="40" height="40">
        <circle
          className="progress-ring-circle-bg"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          className="progress-ring-circle"
          stroke="var(--accent-blue)"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
    </div>
  );
};

export default RoomStats;

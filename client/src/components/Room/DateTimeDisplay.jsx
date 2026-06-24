import React from 'react';
import useClock from '../../hooks/useClock';
import { formatDate, formatTime } from '../../utils/dateFormatter';
import './DateTimeDisplay.css';

const DateTimeDisplay = () => {
  const time = useClock();

  return (
    <div className="datetime-display">
      <div className="time">{formatTime(time)}</div>
      <div className="date">{formatDate(time)}</div>
    </div>
  );
};

export default DateTimeDisplay;

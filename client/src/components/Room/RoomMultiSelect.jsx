import React, { useState } from 'react';
import './RoomMultiSelect.css';

const RoomMultiSelect = ({ members, selected, onChange, singleSelect = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (memberId) => {
    if (singleSelect) {
      onChange(memberId);
      setIsOpen(false);
    } else {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(memberId)) {
        onChange(current.filter(id => id !== memberId));
      } else {
        onChange([...current, memberId]);
      }
    }
  };

  const getSelectedText = () => {
    if (!selected || selected.length === 0) return 'Select a member...';
    if (singleSelect) {
      const member = members.find(m => m._id === selected);
      return member ? member.username : 'Unknown';
    }
    return `${selected.length} selected`;
  };

  return (
    <div className="room-multi-select">
      <div className="select-header" onClick={() => setIsOpen(!isOpen)}>
        {getSelectedText()}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="select-dropdown">
          {members.map(member => (
            <div 
              key={member._id} 
              className={`select-option ${(singleSelect ? selected === member._id : selected?.includes(member._id)) ? 'selected' : ''}`}
              onClick={() => handleSelect(member._id)}
            >
              <div className="mini-avatar" style={{ borderColor: member?.color }}>
                {member?.username?.charAt(0)?.toUpperCase()}
              </div>
              {member.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomMultiSelect;

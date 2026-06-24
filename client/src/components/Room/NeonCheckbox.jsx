import React from 'react';
import './NeonCheckbox.css';

const NeonCheckbox = ({ checked, onChange, color, disabled }) => {
  return (
    <div
      className={`neon-checkbox ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      style={{ '--check-color': color }}
      onClick={disabled ? undefined : onChange}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="checkmark">
          <path fill="none" stroke="currentColor" strokeWidth="3" d="M4 12l5 5L20 6" />
        </svg>
      )}
    </div>
  );
};

export default NeonCheckbox;

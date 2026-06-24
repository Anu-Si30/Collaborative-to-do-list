import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { createTodo, getMyRoomsForPicker } from '../../services/todoService';
import './AddTodoModal.css';

const AddTodoModal = ({ isOpen, onClose, currentRoomId, onAdded }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [allRooms, setAllRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all rooms when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setText('');
    setDate('');
    setError('');
    getMyRoomsForPicker()
      .then((rooms) => {
        const roomList = Array.isArray(rooms) ? rooms : [];
        setAllRooms(roomList);

        // Pre-select the current room by matching _id to currentRoomId
        const currentRoom = roomList.find(
          (r) => r._id === currentRoomId || r._id.toString() === currentRoomId?.toString()
        );
        // Always start with current room selected (use its _id from the API response)
        setSelectedRoomIds(currentRoom ? [currentRoom._id] : []);
      })
      .catch((err) => {
        console.error('Failed to load rooms:', err);
        setAllRooms([]);
        setSelectedRoomIds([]);
      });
  }, [isOpen, currentRoomId]);

  const toggleRoom = (roomId) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) return setError('Please enter a task.');
    if (!date) return setError('Please pick a date.');
    if (selectedRoomIds.length === 0) return setError('Select at least one room.');

    setLoading(true);
    try {
      await createTodo({
        text: text.trim(),
        date,
        roomIds: selectedRoomIds,
      });
      onAdded && onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="add-todo-form">
        {error && <div className="form-error">{error}</div>}

        {/* Task text */}
        <div className="form-group">
          <label>Task</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        {/* Date picker */}
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="date-input"
          />
        </div>

        {/* Multi-room selector */}
        <div className="form-group">
          <label>Add to Rooms</label>
          <div className="room-selector">
            {allRooms.length === 0 ? (
              <p className="no-rooms-hint">Loading your rooms…</p>
            ) : (
              allRooms.map((room) => {
                const selected = selectedRoomIds.includes(room._id);
                return (
                  <button
                    key={room._id}
                    type="button"
                    className={`room-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleRoom(room._id)}
                  >
                    <span className="room-chip-check">{selected ? '✓' : ''}</span>
                    {room.name}
                    <span className="room-chip-code">{room.code}</span>
                  </button>
                );
              })
            )}
          </div>
          <p className="room-selector-hint">
            {selectedRoomIds.length} room{selectedRoomIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || selectedRoomIds.length === 0}
          >
            {loading ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTodoModal;

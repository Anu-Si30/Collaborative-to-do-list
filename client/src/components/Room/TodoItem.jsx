import React, { useState, useEffect } from 'react';
import { toggleTodo, deleteTodo, editTodo } from '../../services/todoService';
import NeonCheckbox from './NeonCheckbox';
import DeleteConfirmModal from './DeleteConfirmModal';
import './TodoItem.css';

const TodoItem = ({ todo, userColor, isOwn, onToggle }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isSaving, setIsSaving] = useState(false);
  // Optimistic local state
  const [localCompleted, setLocalCompleted] = useState(todo.completed);
  const [localText, setLocalText] = useState(todo.text);

  // Sync when the parent updates the todo (socket round-trip)
  useEffect(() => {
    setLocalCompleted(todo.completed);
    setLocalText(todo.text);
    setEditText(todo.text);
  }, [todo.completed, todo.text]);

  const handleToggle = async () => {
    if (!isOwn || isToggling) return;

    const next = !localCompleted;

    // 1. Update visually & tell parent immediately (progress ring updates now)
    setLocalCompleted(next);
    onToggle && onToggle(todo._id, next);

    setIsToggling(true);
    try {
      await toggleTodo(todo._id);
      // Socket event 'todo-toggled' will confirm and sync all other views
    } catch (err) {
      console.error('Toggle failed, reverting', err);
      // Revert optimistic update on error
      setLocalCompleted(!next);
      onToggle && onToggle(todo._id, !next);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTodo(todo._id, true);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete todo', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSave = async () => {
    if (!editText.trim() || editText === localText) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    const previousText = localText;
    try {
      setLocalText(editText); // Optimistically update text
      await editTodo(todo._id, editText);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to edit todo', err);
      setLocalText(previousText); // Revert on failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditText(localText);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className={`todo-item ${localCompleted ? 'completed' : ''}`}>
        <NeonCheckbox
          checked={localCompleted}
          onChange={handleToggle}
          color={userColor}
          disabled={!isOwn || isToggling || isEditing}
        />
        
        {isEditing ? (
          <div className="todo-edit-container">
            <input
              type="text"
              className="todo-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isSaving}
            />
            <button 
              className="todo-save-btn" 
              onClick={handleEditSave}
              disabled={isSaving}
            >
              {isSaving ? '...' : 'Save'}
            </button>
          </div>
        ) : (
          <span className="todo-text">{localText}</span>
        )}

        {isOwn && !isEditing && (
          <div className="todo-actions">
            <button
              className="todo-edit-icon-btn"
              onClick={() => setIsEditing(true)}
              title="Edit task"
              aria-label="Edit task"
            >
              ✎
            </button>
            <button
              className="todo-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              title="Delete task"
              aria-label="Delete task"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemText={todo.text}
      />
    </>
  );
};

export default TodoItem;

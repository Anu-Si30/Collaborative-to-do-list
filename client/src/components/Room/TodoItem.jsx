import React, { useState, useEffect } from 'react';
import { toggleTodo, deleteTodo } from '../../services/todoService';
import NeonCheckbox from './NeonCheckbox';
import DeleteConfirmModal from './DeleteConfirmModal';
import './TodoItem.css';

const TodoItem = ({ todo, userColor, isOwn, onToggle }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Optimistic local state
  const [localCompleted, setLocalCompleted] = useState(todo.completed);

  // Sync when the parent updates the todo (socket round-trip)
  useEffect(() => {
    setLocalCompleted(todo.completed);
  }, [todo.completed]);

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
      await deleteTodo(todo._id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete todo', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className={`todo-item ${localCompleted ? 'completed' : ''}`}>
        <NeonCheckbox
          checked={localCompleted}
          onChange={handleToggle}
          color={userColor}
          disabled={!isOwn || isToggling}
        />
        <span className="todo-text">{todo.text}</span>

        {isOwn && (
          <button
            className="todo-delete-btn"
            onClick={() => setShowDeleteModal(true)}
            title="Delete task"
            aria-label="Delete task"
          >
            ×
          </button>
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

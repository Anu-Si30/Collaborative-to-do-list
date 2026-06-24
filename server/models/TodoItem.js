import mongoose from 'mongoose';

const todoItemSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Links todos created together across multiple rooms so toggling one toggles all
    syncId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

todoItemSchema.index({ room: 1, owner: 1 });
todoItemSchema.index({ syncId: 1 });

const TodoItem = mongoose.model('TodoItem', todoItemSchema);
export default TodoItem;

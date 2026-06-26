import TodoItem from '../models/TodoItem.js';
import Room from '../models/Room.js';
import crypto from 'crypto';

// GET /api/todos/room/:roomId
export const getTodosByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const isMember = room.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Not a member of this room' });

    const todos = await TodoItem.find({ room: roomId })
      .populate('owner', 'username color')
      .sort({ date: 1, createdAt: 1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/todos
// Body: { text, date, roomIds: ['id1','id2',...] }
export const createTodo = async (req, res) => {
  try {
    const { text, date, roomIds } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({ message: 'At least one room must be selected' });
    }

    // Validate all provided roomIds are valid and user is a member
    const validRoomIds = roomIds.filter(Boolean); // remove any null/undefined
    if (validRoomIds.length === 0) {
      return res.status(400).json({ message: 'No valid room IDs provided' });
    }

    const rooms = await Room.find({ _id: { $in: validRoomIds } });
    if (rooms.length !== validRoomIds.length) {
      return res.status(404).json({ message: 'One or more rooms not found' });
    }

    for (const room of rooms) {
      const isMember = room.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({ message: `You are not a member of room "${room.name}"` });
      }
    }

    // Generate a shared syncId so toggling one toggles all linked todos
    const syncId = crypto.randomUUID();

    // Create one TodoItem per selected room
    const created = await Promise.all(
      validRoomIds.map((roomId) =>
        TodoItem.create({
          text: text.trim(),
          date: new Date(date),
          room: roomId,
          owner: req.user._id,
          syncId,
        })
      )
    );

    // Populate all created todos
    const populated = await Promise.all(
      created.map((todo) =>
        TodoItem.findById(todo._id).populate('owner', 'username color')
      )
    );

    // Emit socket event to each affected room
    for (const todo of populated) {
      req.io.to(todo.room.toString()).emit('todo-added', todo);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('createTodo error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/todos/:id/toggle
// Toggles completed on ALL todos sharing the same syncId (cross-room sync)
export const toggleTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can toggle this task' });
    }

    const newCompleted = !todo.completed;

    // Find all linked todos (same syncId) and toggle them all
    let linkedTodos;
    if (todo.syncId) {
      await TodoItem.updateMany({ syncId: todo.syncId }, { completed: newCompleted });
      linkedTodos = await TodoItem.find({ syncId: todo.syncId }).populate('owner', 'username color');
    } else {
      todo.completed = newCompleted;
      await todo.save();
      linkedTodos = [await TodoItem.findById(todo._id).populate('owner', 'username color')];
    }

    // Emit to all affected rooms
    for (const t of linkedTodos) {
      req.io.to(t.room.toString()).emit('todo-toggled', t);
    }

    res.json(linkedTodos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/todos/:id
// Deletes from current room only (or all rooms if ?all=true)
export const deleteTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this task' });
    }

    const deleteAll = req.query.all === 'true';

    if (deleteAll && todo.syncId) {
      // Delete from all rooms
      const linked = await TodoItem.find({ syncId: todo.syncId });
      await TodoItem.deleteMany({ syncId: todo.syncId });
      for (const t of linked) {
        req.io.to(t.room.toString()).emit('todo-deleted', { todoId: t._id.toString() });
      }
    } else {
      // Delete from this room only
      await TodoItem.deleteOne({ _id: req.params.id });
      req.io.to(todo.room.toString()).emit('todo-deleted', { todoId: req.params.id });
    }

    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/todos/:id
// Edits task text on ALL todos sharing the same syncId (cross-room sync)
export const updateTodo = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }

    const todo = await TodoItem.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can edit this task' });
    }

    const newText = text.trim();

    let linkedTodos;
    if (todo.syncId) {
      await TodoItem.updateMany({ syncId: todo.syncId }, { text: newText });
      linkedTodos = await TodoItem.find({ syncId: todo.syncId }).populate('owner', 'username color');
    } else {
      todo.text = newText;
      await todo.save();
      linkedTodos = [await TodoItem.findById(todo._id).populate('owner', 'username color')];
    }

    // Emit to all affected rooms
    for (const t of linkedTodos) {
      req.io.to(t.room.toString()).emit('todo-updated', t);
    }

    res.json(linkedTodos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import express from 'express';
import { getTodosByRoom, createTodo, toggleTodo, deleteTodo } from '../controllers/todoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/room/:roomId', getTodosByRoom);   // GET  /api/todos/room/:roomId
router.post('/', createTodo);                  // POST /api/todos  { text, date, roomIds[] }
router.patch('/:id/toggle', toggleTodo);       // PATCH /api/todos/:id/toggle
router.delete('/:id', deleteTodo);             // DELETE /api/todos/:id

export default router;

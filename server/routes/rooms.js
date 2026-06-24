import express from 'express';
import {
  createRoom,
  joinRoom,
  getUserRooms,
  getRoomById,
  getRoomByCode,
  leaveRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getUserRooms);             // GET  /api/rooms
router.post('/', createRoom);              // POST /api/rooms
router.post('/join', joinRoom);            // POST /api/rooms/join  { code }
router.get('/id/:id', getRoomById);        // GET  /api/rooms/id/:id  (by MongoDB _id)
router.get('/code/:code', getRoomByCode);  // GET  /api/rooms/code/:code
router.post('/:id/leave', leaveRoom);      // POST /api/rooms/:id/leave
router.delete('/:id', deleteRoom);         // DELETE /api/rooms/:id  (creator only)

export default router;

import express from 'express';
import { 
  searchUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  getFriendsAndRequests,
  getRoomInvites,
  acceptRoomInvite,
  rejectRoomInvite,
  updateColor
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.post('/friend-request', sendFriendRequest);
router.post('/friend-request/accept', acceptFriendRequest);
router.post('/friend-request/reject', rejectFriendRequest);
router.delete('/friend/:friendId', removeFriend);
router.get('/friends', getFriendsAndRequests);

// Room Invites
router.get('/room-invites', getRoomInvites);
router.post('/room-invites/accept', acceptRoomInvite);
router.post('/room-invites/reject', rejectRoomInvite);

router.put('/color', updateColor); // PUT /api/users/color

export default router;

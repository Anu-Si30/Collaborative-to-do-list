import User from '../models/User.js';
import Room from '../models/Room.js';

// Search users by username or email
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.friendRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    if (targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    // Emit socket event to target user
    req.io.to(`user_${targetUser._id.toString()}`).emit('friend-request', { from: req.user.username });

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    // Remove from requests, add to friends
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    if (!user.friends.includes(requesterId)) {
      user.friends.push(requesterId);
    }
    await user.save();

    // Also add to requester's friends list
    const requester = await User.findById(requesterId);
    if (requester && !requester.friends.includes(user._id)) {
      requester.friends.push(user._id);
      await requester.save();
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;

    const user = await User.findById(req.user._id);
    
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    const user = await User.findById(req.user._id);
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    const friend = await User.findById(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());
      await friend.save();
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List friends and pending requests
export const getFriendsAndRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username email color')
      .populate('friendRequests', 'username email color');
      
    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------------
// Room Invitations
// ----------------------------------------------------

export const getRoomInvites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'roomInvites',
      select: 'name code owner',
      populate: { path: 'owner', select: 'username color' }
    });
    res.json(user.roomInvites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptRoomInvite = async (req, res) => {
  try {
    const { roomId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.roomInvites.includes(roomId)) {
      return res.status(400).json({ message: 'No invite found for this room' });
    }

    // Remove from invites
    user.roomInvites = user.roomInvites.filter(id => id.toString() !== roomId);
    await user.save();

    // Add to room members
    const room = await Room.findById(roomId);
    if (room && !room.members.includes(user._id)) {
      room.members.push(user._id);
      await room.save();
      
      const populatedUser = { _id: user._id, username: user.username, color: user.color };
      req.io.to(roomId).emit('member-joined', { user: populatedUser });
    }

    res.json({ message: 'Room invite accepted', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRoomInvite = async (req, res) => {
  try {
    const { roomId } = req.body;
    const user = await User.findById(req.user._id);

    user.roomInvites = user.roomInvites.filter(id => id.toString() !== roomId);
    await user.save();

    res.json({ message: 'Room invite rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

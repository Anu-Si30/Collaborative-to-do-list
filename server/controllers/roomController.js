import Room from '../models/Room.js';
import User from '../models/User.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

export const createRoom = async (req, res) => {
  try {
    const { name, invitedFriends = [] } = req.body;
    let code = generateRoomCode();

    // Ensure uniqueness
    let existingRoom = await Room.findOne({ code });
    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await Room.findOne({ code });
    }

    const room = await Room.create({
      code,
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    // Handle invitations
    if (invitedFriends.length > 0) {
      for (const friendId of invitedFriends) {
        await User.findByIdAndUpdate(friendId, {
          $addToSet: { roomInvites: room._id }
        });
        
        // Emit socket event to the invited friend
        const populatedForInvite = await Room.findById(room._id)
          .select('name code owner')
          .populate('owner', 'username color');
        
        req.io.to(`user_${friendId}`).emit('room-invite', populatedForInvite);
      }
    }

    // Return with members populated so the frontend has full user objects
    const populated = await Room.findById(room._id)
      .populate('owner', 'username color')
      .populate('members', 'username color');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Room code is required' });

    const room = await Room.findOne({ code: code.toString() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found. Check the code and try again.' });
    }

    const alreadyMember = room.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      room.members.push(req.user._id);
      await room.save();
    }

    const populated = await Room.findById(room._id)
      .populate('owner', 'username color')
      .populate('members', 'username color');

    // Notify everyone already in the room that a new member joined
    // (use room._id as the socket channel key)
    const newMember = populated.members.find(
      (m) => m._id.toString() === req.user._id.toString()
    );
    req.io.to(room._id.toString()).emit('member-joined', { user: newMember });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('owner', 'username color')
      .populate('members', 'username color');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lookup by MongoDB _id (used when navigating to /room/:id)
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('owner', 'username color')
      .populate('members', 'username color');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lookup by room code (used for joining)
export const getRoomByCode = async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code })
      .populate('owner', 'username color')
      .populate('members', 'username color');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this room' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const username = req.user.username;

    // If creator and only member, delete the room entirely
    if (room.owner.toString() === req.user._id.toString() && room.members.length === 1) {
      await Room.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Room deleted' });
    }

    room.members = room.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await room.save();

    // Notify remaining members
    req.io.to(req.params.id).emit('member-left', {
      userId: req.user._id.toString(),
      username,
    });

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can delete it' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

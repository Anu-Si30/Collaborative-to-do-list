const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Bind this socket connection to a specific user for private messaging
    socket.on('identify', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} identified as user_${userId}`);
    });

    // Client emits 'join-room' with the room's MongoDB _id when entering a room page
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room channel: ${roomId}`);
    });

    // Client emits 'leave-room' when navigating away from the room page
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room channel: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default setupSocket;

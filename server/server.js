const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const RoomManager = require('./room');
const DrawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../client')));

const rooms = new RoomManager();
const state = new DrawingState();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let currentRoom = null;
  let currentUserId = socket.id;
  let currentUserName = null;

  // User joins with name
  socket.on('join', (data) => {
    currentUserName = data.name || 'Anonymous';
    currentRoom = data.room || 'default';
    const userColor = getRandomColor();

    socket.join(currentRoom);
    rooms.addUser(currentRoom, currentUserId, userColor, currentUserName);

    // Send initial state
    socket.emit('init', {
      userId: currentUserId,
      userName: currentUserName,
      color: userColor,
      history: state.getHistory(currentRoom),
      users: rooms.getUsers(currentRoom)
    });

    // Notify others
    socket.to(currentRoom).emit('user_joined', {
      userId: currentUserId,
      userName: currentUserName,
      color: userColor
    });
  });

  // Handle drawing
  socket.on('draw', (data) => {
    if (!currentRoom) return;
    
    const stroke = {
      ...data,
      userId: currentUserId,
      userName: currentUserName,
      timestamp: Date.now()
    };

    state.addStroke(currentRoom, stroke);
    socket.to(currentRoom).emit('draw', stroke);
  });

  // Handle cursor movement
  socket.on('cursor_move', (data) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('cursor_move', {
      userId: currentUserId,
      userName: currentUserName,
      x: data.x,
      y: data.y
    });
  });

  // Handle undo
  socket.on('undo', (data) => {
    if (!currentRoom) return;
    state.removeStroke(currentRoom, data.strokeId);
    io.to(currentRoom).emit('undo', { strokeId: data.strokeId });
  });

  // Handle redo
  socket.on('redo', (data) => {
    if (!currentRoom) return;
    const stroke = { ...data.stroke, userId: currentUserId };
    state.addStroke(currentRoom, stroke);
    io.to(currentRoom).emit('draw', stroke);
  });

  // Handle clear
  socket.on('clear_canvas', () => {
    if (!currentRoom) return;
    state.clearHistory(currentRoom);
    io.to(currentRoom).emit('clear_canvas');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (currentRoom) {
      rooms.removeUser(currentRoom, currentUserId);
      socket.to(currentRoom).emit('user_left', { 
        userId: currentUserId,
        userName: currentUserName
      });
    }
  });
});

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  return colors[Math.floor(Math.random() * colors.length)];
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
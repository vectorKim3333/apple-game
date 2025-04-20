require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Socket.io server is running');
});

// 랜덤 roomId 생성 함수
function generateRoomId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 방별 점수 저장
const roomScores = {}; // { roomId: { [socketId]: 점수, ... } }

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    for (const roomId in roomScores) {
      if (roomScores[roomId][socket.id] !== undefined) {
        delete roomScores[roomId][socket.id];
        if (Object.keys(roomScores[roomId]).length === 0) {
          delete roomScores[roomId];
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });

  // 메시지 브로드캐스트 예시
  socket.on('message', (data) => {
    io.emit('message', data);
  });

  // 방 생성
  socket.on('createRoom', () => {
    const roomId = generateRoomId();
    socket.join(roomId);
    // 점수 초기화
    roomScores[roomId] = { [socket.id]: 0 };
    console.log(`[room] ${socket.id} created room ${roomId}`);
    socket.emit('roomCreated', roomId);
  });

  // 방 입장
  socket.on('joinRoom', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      socket.emit('joinError', '방이 존재하지 않습니다.');
      return;
    }
    if (room.size >= 2) {
      socket.emit('joinError', '방이 가득 찼습니다.');
      return;
    }
    socket.join(roomId);
    // 점수 등록
    if (!roomScores[roomId]) roomScores[roomId] = {};
    roomScores[roomId][socket.id] = 0;
    console.log(`[room] ${socket.id} joined room ${roomId}`);
    // 방에 2명이 되면 양쪽에 알림
    if (room.size === 2) {
      io.to(roomId).emit('opponentJoined');
    }
    socket.emit('joinedRoom', roomId);
  });

  // 게임 시작 동기화
  socket.on('startGameInRoom', (roomId) => {
    console.log(`[room] ${socket.id} requested startGameInRoom for ${roomId}`);
    io.to(roomId).emit('startGameInRoom');
  });

  // 점수 증가 요청 및 동기화
  socket.on('scoreAddRequest', ({ roomId, add }) => {
    if (!roomScores[roomId]) return;
    if (!roomScores[roomId][socket.id]) roomScores[roomId][socket.id] = 0;
    roomScores[roomId][socket.id] += add;
    io.to(roomId).emit('scoreUpdated', { scores: roomScores[roomId] });
  });

  // 게임 다시 시작 시 점수 초기화
  socket.on('restartGameInRoom', (roomId) => {
    console.log(`[room] ${socket.id} requested restartGameInRoom for ${roomId}`);
    if (roomScores[roomId]) {
      Object.keys(roomScores[roomId]).forEach(id => {
        roomScores[roomId][id] = 0;
      });
      io.to(roomId).emit('scoreUpdated', { scores: roomScores[roomId] });
    }
    io.to(roomId).emit('restartGameInRoom');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
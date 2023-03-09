import http from 'node:http';

import cors from 'cors';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

// 基于socket实现的服务端只负责转发数据，无计算逻辑
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:8999',
    methods: ['GET', 'POST'],
  },
});

let nextSiteId = 1;

io.on('connection', (socket: any) => {
  // Give the client a client id
  socket.emit('site_id', nextSiteId);
  nextSiteId += 1;

  // msgData is a list of WStringOperation instances
  socket.on('text_operations', (msgData: any) => {
    // 👇🏻 Emits an event to all connected clients
    io.emit('text_operations', msgData);
  });
});

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, function () {
  console.log('listening on http://localhost:' + PORT);
});

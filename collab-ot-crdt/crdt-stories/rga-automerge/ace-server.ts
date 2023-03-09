import http from 'node:http';

import cors from 'cors';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer } from 'ws';

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
// io.set('transports', ['websocket']);

// const io = new WebSocketServer({ server: httpServer })

let nextUserId = 1;

io.on('connection', function (socket) {
  const userId = nextUserId++;

  console.log('connection - assigning id ' + userId);
  socket.emit('init', { id: userId });

  socket.on('message', (op) => {
    socket.broadcast.emit('message', op);
  });
});

const broadcastOp = (op, clients, exclude = undefined) => {
  for (const c of clients) {
    // if (c !== exclude) {
    c.send(JSON.stringify(op));
    // }
  }
};

// io.on('connection', socket => {
//   const userId = nextUserId++;

//   console.log('connection - assigning id ' + userId);

//   // socket.emit('init', { id: userId });
//   socket.send(JSON.stringify({ type: 'init', id: userId }));

//   socket.on('message', (msgBytes) => {
//     const rawJSON = msgBytes.toString('utf-8');
//     const op = JSON.parse(rawJSON);
//     console.log('got op', op);
//     broadcastOp(op, io.clients);
//     // socket.broadcast.emit('message', op);
//   });
// });

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, function () {
  console.log('listening on http://localhost:' + PORT);
});

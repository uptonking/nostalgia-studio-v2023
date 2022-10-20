import cors from 'cors';
import express from 'express';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

import { router } from './routes';

const port = process.env.PORT || 4001;

const app = express();
app.use(router);
app.use(cors());
app.set('port', port);

const httpServer = http.createServer(app);

/** 当前最新pm文档对象，仅放在内存，未持久化，其他客户端能直接拿到这个最新文档 */
let currentDoc;

// 基于socket实现的服务端只负责转发数据，无计算逻辑
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:8999',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(`Client: ${socket.id} disconnected`);
  });

  socket.on('hello', () => {
    console.log(`New Client: ${socket.id} connected`);
    socket.emit('init', currentDoc);
  });

  // 👇🏻️ 服务端只接收编辑操作数据steps并转发，自身并没有处理逻辑和transform逻辑
  // ❌ 不应该每次发送全量doc
  // ❓ 协同编辑情况下，是否缺少应该接收一个versionA的op1，忽略另一个versionA的op2
  socket.on('update', (data) => {
    const { version, steps, clientId, doc } = data;
    console.log(';; ver-clientId-steps ', version, clientId, steps);

    currentDoc = doc;
    socket.broadcast.emit('updateDoc', {
      version,
      steps,
      clientId,
      doc,
    });
  });
});

httpServer.listen(port, () =>
  console.log(`server is listening on http://localhost:${port}`),
);

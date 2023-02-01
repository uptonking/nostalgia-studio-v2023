import http from 'node:http';

import cors from 'cors';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';

import { EditorSocketServer } from './editor-server-socketio';

const port = process.env.PORT || 4001;

const app = express();
app.use(cors());
app.set('port', port);

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:8999',
    methods: ['GET', 'POST'],
  },
});

// 在服务端添加各种事件监听器
const editorServer = new EditorSocketServer('', [], '1');

io.on('connection', (socket) => {
  // 连接时会发送最新doc对象和版本
  editorServer.addClient(socket);
});

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

httpServer.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});

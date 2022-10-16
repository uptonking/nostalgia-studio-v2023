import cors from 'cors';
import express from 'express';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

import { EditorSocketIOServer } from './editor-server-socketio';

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

const server = new EditorSocketIOServer('', [], 1);

io.on('connection', (socket) => {
  server.addClient(socket);
});

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });
// app.use('/node_modules', express.static('node_modules'));
// app.use('/ot.js', express.static('ot.js'));
// app.use('/dist', express.static('dist'));

httpServer.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});

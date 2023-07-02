// #!/usr/bin/env node

// /**
//  * @type {any}
//  */
// const http = require('http');
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ noServer: true });
// const setupWSConnection = require('./utils').setupWSConnection;

// const host = process.env.HOST || 'localhost';
// const port = process.env.PORT || 1234;

// const server = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'text/plain' });
//   response.end('okay');
// });

// wss.on('connection', setupWSConnection);

// server.on('upgrade', (request, socket, head) => {
//   // You may check auth of request here..
//   // See https://github.com/websockets/ws#client-authentication
//   /**
//    * @param {any} ws
//    */
//   const handleAuth = (ws) => {
//     wss.emit('connection', ws, request);
//   };
//   wss.handleUpgrade(request, socket, head, handleAuth);
// });

// server.listen(port, host, () => {
//   console.log(`running at '${host}' on port ${port}`);
// });

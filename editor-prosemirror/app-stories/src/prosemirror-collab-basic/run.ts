// const handler = require('serve-handler');
import http from 'node:http';

import { handleCollabRequest } from './server/server';

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  // return maybeCollab(request, response) || handler(request, response);
  return maybeCollab(request, response);
});

function maybeCollab(
  req: http.IncomingMessage,
  resp: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  },
) {
  const url = req.url;
  const backend = url.replace(/\/collab-backend\b/, '');
  console.log(';; maybeCollab ', backend !== url);

  if (backend !== url) {
    req.url = backend;
    if (handleCollabRequest(req, resp)) return true;
    req.url = url;
  }

  return false;
}

server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});

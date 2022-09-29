// const handler = require('serve-handler');
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

import { handleCollabRequest } from './server/server';

const server = createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options

  // return maybeCollab(request, response) || handler(request, response);
  return maybeCollab(request, response);
});

function maybeCollab(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) {
  const url = request.url;
  const backend = url.replace(/\/collab-backend\b/, '');
  console.log(';; url ', request.method, backend !== url, backend);

  if (request.method === 'OPTIONS') {
    const headers = {
      'Access-Control-Allow-Origin': '*', // @dev First, read about security
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    };
    response.writeHead(204, headers);
    response.end();
    return;
  }

  if (backend !== url) {
    request.url = backend;
    if (handleCollabRequest(request, response)) {
      return true;
    }
    request.url = url;
  }

  return false;
}

server.listen(3001, () => {
  console.log('Running at http://localhost:3000');
});

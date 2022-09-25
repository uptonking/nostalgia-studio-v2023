const handler = require('serve-handler');
const http = require('http');
const {handleCollabRequest} = require("./server/server")

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return maybeCollab(request, response) || handler(request, response);
})

function maybeCollab(req, resp) {
  let url = req.url, backend = url.replace(/\/collab-backend\b/, "")
  if (backend != url) {
    req.url = backend
    if (handleCollabRequest(req, resp)) return true
    req.url = url
  }
  return false
}

server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});

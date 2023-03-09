import fileSystem from 'fs';
import http from 'http';
import pathLib from 'path';

/** global ops/changes */
const events: any[] = [];
/** {clientId: eventLength}
 * ?似乎每个clientId的值都相同
 */
const cursors: Record<string, number> = {};

const server = http.createServer((req, res) => {
  const path = req.url;
  let reqBody = '';

  req.on('data', function (data) {
    reqBody += data;
  });

  req.on('end', function () {
    // if (path === '/') {
    //   serve(res, 'index.html');
    //   return;
    // }
    // if (path && path.endsWith('.js')) {
    //   serve(res, path);
    //   return;
    // }

    let params;
    try {
      params = JSON.parse(reqBody);
    } catch (error) {
      console.log(';; parse-err ', error);
    }

    if (path === '/snd') {
      events.push(params);
      console.log('/snd', reqBody);
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      });
      res.end('ok');
    } else if (path === '/rcv') {
      console.log('/rcv', reqBody);
      const clientId = params.clientId;
      const data: any[] = [];
      if (typeof cursors[clientId] === 'undefined') cursors[clientId] = 0;
      for (let idx = cursors[clientId]; idx < events.length; idx++) {
        const event = events[idx];
        data.push(event);
      }
      cursors[clientId] = events.length;
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(data));
    } else {
      console.log('404');
      res.writeHead(404, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      });
      res.end('not found');
    }
  });
});

const PORT = 8089;
server.listen(PORT, () => {
  console.log('server is listening on http://localhost:' + PORT);
});

function serve(res, file) {
  const filePath = pathLib.join(__dirname, file);
  const stat = fileSystem.statSync(filePath);

  let contentType = 'text/html';
  if (file.endsWith('.js')) {
    contentType = 'text/js';
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
  });

  const readStream = fileSystem.createReadStream(filePath);
  readStream.pipe(res);
}

// setInterval(() => {
//   console.log(';; srv-data ', cursors, events);
// }, 30 * 1000);

import { Step } from 'prosemirror-transform';
import { type IncomingMessage, type ServerResponse } from 'node:http';
import { getInstance, instanceInfo, type Instance } from './instance';
import { Router } from './route';
import { schema } from './schema';

const router = new Router();

export const handleCollabRequest = function (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) {
  // console.log(';; 处理router ');
  // console.dir(router);
  return router.resolve(request, response);
};

/** Object that represents an HTTP response. */
class Output {
  code: number;
  body: string;
  type: string;

  constructor(code, body, type = undefined) {
    this.code = code;
    this.body = body;
    this.type = type || 'text/plain';
  }

  // static json(data: Record<string, unknown>) {
  static json(data: unknown) {
    return new Output(200, JSON.stringify(data), 'application/json');
  }

  /** Write the response. */
  resp(resp: ServerResponse<IncomingMessage>) {
    const headers = {
      'Access-Control-Allow-Origin': '*' /* @dev First, read about security */,
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    };
    resp.writeHead(this.code, { 'Content-Type': this.type, ...headers });
    resp.end(this.body);
  }
}

/** : (stream.Readable, Function)
 * - Invoke a callback with a stream's data.
 */
function readStreamAsJSON(stream, callback) {
  let data = '';
  stream.on('data', (chunk) => (data += chunk));
  stream.on('end', () => {
    let result;
    let error;
    try {
      result = JSON.parse(data);
    } catch (e) {
      error = e;
    }
    callback(error, result);
  });
  stream.on('error', (e) => callback(e));
}

/** : (string, Array, Function)
 * - Register a server route.
 */
function handle(method: string, url: string[], f: (...args1: any) => Output) {
  router.add(
    method,
    url,
    (req: IncomingMessage, resp: ServerResponse<IncomingMessage>, ...args2) => {
      function finish() {
        let output: Output;
        try {
          output = f(...args2, req, resp);
        } catch (err) {
          console.log(err.stack);
          output = new Output(err.status || 500, err.toString());
        }
        if (output) {
          output.resp(resp);
        }
      }

      if (method === 'PUT' || method === 'POST') {
        readStreamAsJSON(req, (err, val) => {
          if (err) new Output(500, err.toString()).resp(resp);
          else {
            args2.unshift(val);
            finish();
          }
        });
      } else {
        // /处理get
        finish();
      }
    },
  );
}

/** The root endpoint outputs a list of the collaborative
 * editing document instances.
 */
handle('GET', ['docs'], () => {
  return Output.json(instanceInfo());
});

/** Output the current state of a document instance. */
handle('GET', ['docs', null], (id, req) => {
  const inst = getInstance(id, reqIP(req));
  return Output.json({
    doc: inst.doc.toJSON(),
    users: inst.userCount,
    version: inst.version,
    comments: inst.comments.comments,
    commentVersion: inst.comments.version,
  });
});

function nonNegInteger(str: string) {
  const num = Number(str);
  if (!isNaN(num) && Math.floor(num) == num && num >= 0) return num;
  const err = new Error('Not a non-negative integer: ' + str);
  // @ts-expect-error custom prop
  err.status = 400;
  throw err;
}

/** An object to assist in waiting for a collaborative editing
 * instance to publish a new version before sending the version
 * event data to the client.
 */
export class Waiting {
  resp: ServerResponse<IncomingMessage>;
  inst: Instance;
  ip: any;
  finish: any;
  done: boolean;
  constructor(resp: ServerResponse<IncomingMessage>, inst, ip, finish) {
    this.resp = resp;
    this.inst = inst;
    this.ip = ip;
    this.finish = finish;
    this.done = false;
    /** 👇🏻 每个waiting对象都会使请求的response进入等待状态，默认等待N分钟*/
    resp.setTimeout(1000 * 60 * 0.5, () => {
      this.abort();
      this.send(Output.json({}));
    });
  }

  abort() {
    const found = this.inst.waitings.indexOf(this);
    if (found > -1) this.inst.waitings.splice(found, 1);
  }

  send(output: Output) {
    if (this.done) return;
    output.resp(this.resp);
    this.done = true;
  }
}

function outputEvents(inst, data) {
  return Output.json({
    version: inst.version,
    commentVersion: inst.comments.version,
    steps: data.steps.map((s) => s.toJSON()),
    clientIDs: data.steps.map((step) => step.clientID),
    comment: data.comment,
    users: data.users,
  });
}

/** An endpoint for a collaborative document instance which
 * returns all events between a given version and the server's
 * current version of the document.
 */
handle(
  'GET',
  ['docs', null, 'events'],
  (
    id,
    req: IncomingMessage & { query: any },
    resp: ServerResponse<IncomingMessage>,
  ) => {
    const version = nonNegInteger(req.query.version);
    const commentVersion = nonNegInteger(req.query.commentVersion);

    const inst = getInstance(id, reqIP(req)) as Instance;
    const data = inst.getEvents(version, commentVersion);
    if (data === false) return new Output(410, 'History no longer available');
    // If the server version is greater than the given version,
    // return the data immediately.
    if (data.steps.length || data.comment.length)
      return outputEvents(inst, data);
    // 👉🏻 If the server version matches the given version,
    // wait until a new version is published to return the event data.
    const wait = new Waiting(resp, inst, reqIP(req), () => {
      wait.send(outputEvents(inst, inst.getEvents(version, commentVersion)));
    });
    inst.waitings.push(wait);
    resp.on('close', () => wait.abort());
  },
);

function reqIP(request) {
  return request.headers['x-forwarded-for'] || request.socket.remoteAddress;
}

/** The event submission endpoint, which a client sends an event to.
 */
handle('POST', ['docs', null, 'events'], (data, id, req) => {
  const version = nonNegInteger(data.version);
  const steps = data.steps.map((s) => Step.fromJSON(schema, s));
  const result = getInstance(id, reqIP(req)).addEvents(
    version,
    steps,
    data.comment,
    data.clientID,
  );
  if (!result) return new Output(409, 'Version not current');
  else return Output.json(result);
});

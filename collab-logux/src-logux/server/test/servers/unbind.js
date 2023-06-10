import { Server } from '../../index';

let app = new Server({
  subprotocol: '1.0.0',
  supports: '1.x',
});
app.nodeId = 'server:FnXaqDxY';

app.destroy();

setTimeout(() => {}, 10000);

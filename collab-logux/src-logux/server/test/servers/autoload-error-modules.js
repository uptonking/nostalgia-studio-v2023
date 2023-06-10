import { Server } from '../../index';

let app = new Server({
  subprotocol: '1.0.0',
  supports: '1.x',
  fileUrl: import.meta.url,
});
app.nodeId = 'server:FnXaqDxY';

app.auth(async () => true);

app.listen().then(() => {
  app.autoloadModules('error-modules/*/index.js');
});

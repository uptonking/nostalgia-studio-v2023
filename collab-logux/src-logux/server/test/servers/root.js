import { join } from 'path';
import { fileURLToPath } from 'url';

import { Server } from '../../index';

let app = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    host: '127.0.0.1',
    root: join(fileURLToPath(import.meta.url), '..', '..', 'fixtures'),
  }),
);
app.nodeId = 'server:FnXaqDxY';

app.auth(async () => true);

app.listen();

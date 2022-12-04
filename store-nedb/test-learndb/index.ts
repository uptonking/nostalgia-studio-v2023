import repl from 'repl';

import { eval1 } from './starter-db';

repl.start({
  prompt: 'db11 $ ',
  eval: eval1,
});

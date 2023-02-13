import { copy } from './copy';
import { decorations } from './decorations';
import { history } from './history';
import { input } from './input';
import { keyboard } from './keyboard';
import { paste } from './paste';
import { rendering } from './rendering';
import { selection } from './selection';

export const defaultModules = {
  keyboard,
  input,
  copy,
  paste,
  history,
  decorations,
  rendering,
  selection,
};

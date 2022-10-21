import { api } from './api';
import { makeType } from './text';

const textString = makeType();
const type = {
  ...textString,
  api,
};

export { type };

import { createEditor, createText } from './creators';
import {
  createHyperscript,
  type HyperscriptCreators,
  type HyperscriptShorthands,
} from './hyperscript';

/**
 * The default hyperscript factory that ships with Slate, without custom tags.
 */

const jsx = createHyperscript();

export {
  jsx,
  createHyperscript,
  createEditor,
  createText,
  type HyperscriptCreators,
  type HyperscriptShorthands,
};

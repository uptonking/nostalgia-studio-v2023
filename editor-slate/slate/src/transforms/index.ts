import { GeneralTransforms } from './general';
import { NodeTransforms } from './node';
import { SelectionTransforms } from './selection';
import { TextTransforms } from './text';

/**
 * - Transforms are a specific set of helpers that allow you to perform a wide variety of specific changes to the document
 * - Slate's data structure is immutable, so you can't modify or delete nodes directly
 * - Slate comes with a collection of "transform" functions that let you change your editor's value.
 * - Transform分为几类：Selection、Text、Node
 * - Many transforms act on a specific location in the document. By default, they will use the user's current selection. But this can be overridden with the `at` option.
 * - Many of the node-based transforms take a `match` function option, which restricts the transform to only apply to nodes for which the function returns `true`
 */
export const Transforms: GeneralTransforms &
  NodeTransforms &
  SelectionTransforms &
  TextTransforms = {
  ...GeneralTransforms,
  ...NodeTransforms,
  ...SelectionTransforms,
  ...TextTransforms,
};

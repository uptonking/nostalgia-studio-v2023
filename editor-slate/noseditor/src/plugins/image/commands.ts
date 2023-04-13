import { Editor, Element, Location, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import type { ImageElement } from './types';
import { createImageNode } from './utils';

export const insertImage = (editor: Editor, url: string) => {
  const image: ImageElement = createImageNode({ url })
  Transforms.insertNodes(editor, image)
}

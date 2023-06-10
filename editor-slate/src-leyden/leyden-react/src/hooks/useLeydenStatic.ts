import { useSlateStatic } from 'slate-react';

import { type ReactEditor } from '../plugin/ReactEditor';

export const useLeydenStatic = (): ReactEditor => useSlateStatic();

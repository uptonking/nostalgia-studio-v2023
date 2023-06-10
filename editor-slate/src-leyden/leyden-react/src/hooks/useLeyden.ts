import { useSlate } from 'slate-react';

import { type ReactEditor } from '../plugin/ReactEditor';

export const useLeyden = (): ReactEditor => useSlate();

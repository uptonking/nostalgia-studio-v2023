import { createContext, useContext } from 'react';

import { type EditorContext, createDefaultProviders } from './Providers';

export type { EditorContext } from './Providers';

export const ReactEditorContext = createContext<EditorContext>(
  createDefaultProviders(),
);

export const useEditorContext = () => useContext(ReactEditorContext);

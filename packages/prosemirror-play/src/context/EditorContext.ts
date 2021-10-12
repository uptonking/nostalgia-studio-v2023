import { createContext, useContext } from 'react';

import { IProviders, createDefaultProviders } from './Providers';

export type EditorContext = IProviders;

export const ReactEditorContext = createContext<EditorContext>(
  createDefaultProviders(),
);

/** context传递的默认值是createDefaultProviders() */
export const useEditorContext = () => useContext(ReactEditorContext);

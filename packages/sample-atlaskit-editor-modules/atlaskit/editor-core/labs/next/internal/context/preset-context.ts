import * as React from 'react';

import type { EditorPlugin } from '../../../../types';

const PresetContext = React.createContext<Array<EditorPlugin>>([]);
/** 用来传递多个ak-EditorPlugins */
const PresetProvider = PresetContext.Provider;
const usePresetContext = () => React.useContext(PresetContext);

export { PresetProvider, usePresetContext };

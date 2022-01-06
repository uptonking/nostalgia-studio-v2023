import { PluginKey } from 'prosemirror-state';

import type { MacroState } from './types';

export const pluginKey = new PluginKey<MacroState>('macroPlugin');

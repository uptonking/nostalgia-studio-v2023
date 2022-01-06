import { PluginKey } from 'prosemirror-state';

import type { TypeAheadPluginState } from '../types';

export const pluginKey = new PluginKey<TypeAheadPluginState>('typeAheadPlugin');

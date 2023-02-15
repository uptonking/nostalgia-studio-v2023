import type { AttributeMapType, EditorRange } from '@typewriter/document';

import type { Editor } from '../editor';
import type { Commands } from '../typesetting';

export interface Shortcuts {
  [shortcut: string]: string;
}

export interface Module {
  init?: () => void;
  destroy?: () => void;
  shortcuts?: Shortcuts;
  commands?: Commands;
  getActive?: () => AttributeMapType;
  trimSelection?: (range: EditorRange) => EditorRange;
  [name: string]: any;
}

export interface ModuleInitializers {
  [name: string]: ModuleInitializer;
}

export interface ModuleInitializer {
  (editor: Editor): Module;
}

export interface Modules {
  [name: string]: Module;
}

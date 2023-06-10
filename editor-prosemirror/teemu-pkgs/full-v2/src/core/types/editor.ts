import { type EditorState } from 'prosemirror-state';
import type React from 'react';

import { type EditorContext } from '../../context';

export type EditorAppearance = 'full-page';

export interface EditorProps {
  children: React.ReactNode;
  disabled?: boolean;
  appearance?: EditorAppearance;
  onEditorReady?: (ctx: EditorContext) => void;
  onDocumentEdit?: (newState: EditorState) => void;
}

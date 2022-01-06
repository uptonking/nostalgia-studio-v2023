import type { EditorAppearance } from '../types';

/** return appearance === 'full-page' || appearance === 'full-width'; */
export function isFullPage(appearance?: EditorAppearance) {
  return appearance === 'full-page' || appearance === 'full-width';
}

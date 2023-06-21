export const MAX_HISTORY_STEPS = 49;
export const DEFAULT_REVISION_ID = 'START_REVISION_ID';

export const DIRECTION = {
  Up: 'Up',
  Down: 'Down',
  Left: 'Left',
  Right: 'Right',
} as const;

export const CellValueDataTypes = {
  Boolean: 'Boolean',
  Number: 'Number',
  Text: 'Text',
  Empty: 'Empty',
  Error: 'Error',
} as const;

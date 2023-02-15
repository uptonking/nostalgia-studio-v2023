export type SourceString = typeof Source[keyof typeof Source] | string;

export const Source = {
  api: 'api',
  user: 'user',
  history: 'history',
  input: 'input',
  paste: 'paste',
} as const;

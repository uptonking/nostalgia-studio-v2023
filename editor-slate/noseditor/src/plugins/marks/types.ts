export type FormattedText = {
  text: string;
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
  code?: true;
};


export type TextFormats = keyof Omit<FormattedText, 'text'>;

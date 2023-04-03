export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string;
  color?: string;
  bgColor?: string;
};

export type TextFormats = keyof Omit<FormattedText, 'text'>;

export const TextAlignValues = {
  AlignLeft: 'alignLeft',
  AlignCenter: 'alignCenter',
  AlignRight: 'alignRight',
  AlignJustify: 'alignJustify',
} as const;

export type TextAlignValuesType =
  (typeof TextAlignValues)[keyof typeof TextAlignValues];

export const ListItemDefaultIndentWidth = 24;

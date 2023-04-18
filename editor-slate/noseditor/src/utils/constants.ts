export const TextAlignValues = {
  ALIGN_LEFT: 'alignLeft',
  ALIGN_CENTER: 'alignCenter',
  ALIGN_Right: 'alignRight',
  ALIGN_JUSTIFY: 'alignJustify',
} as const;

export type TextAlignValueType =
  (typeof TextAlignValues)[keyof typeof TextAlignValues];

export const ListItemDefaultIndentWidth = 24;

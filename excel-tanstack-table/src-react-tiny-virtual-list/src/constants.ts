export enum ALIGNMENT {
  AUTO = 'auto',
  START = 'start',
  CENTER = 'center',
  END = 'end',
  SMART = 'smart',
}

export enum DIRECTION {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export enum SCROLL_CHANGE_REASON {
  /** caused by scroll event */
  OBSERVED = 'observed',
  /** caused by controlled update */
  REQUESTED = 'requested',
}

export const scrollProp: { [key in DIRECTION]: string } = {
  [DIRECTION.VERTICAL]: 'scrollTop',
  [DIRECTION.HORIZONTAL]: 'scrollLeft',
};

export const sizeProp: { [key in DIRECTION]: string } = {
  [DIRECTION.VERTICAL]: 'height',
  [DIRECTION.HORIZONTAL]: 'width',
};

export const positionProp: { [key in DIRECTION]: string } = {
  [DIRECTION.VERTICAL]: 'top',
  [DIRECTION.HORIZONTAL]: 'left',
};

export const marginProp: { [key in DIRECTION]: string } = {
  [DIRECTION.VERTICAL]: 'marginTop',
  [DIRECTION.HORIZONTAL]: 'marginLeft',
};

export const oppositeMarginProp: { [key in DIRECTION]: string } = {
  [DIRECTION.VERTICAL]: 'marginBottom',
  [DIRECTION.HORIZONTAL]: 'marginRight',
};

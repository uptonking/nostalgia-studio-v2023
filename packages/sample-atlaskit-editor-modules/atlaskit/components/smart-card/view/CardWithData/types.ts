import type { JsonLd } from 'json-ld-types';
import type { EventHandler, KeyboardEvent, MouseEvent } from 'react';

import type { InlinePreloaderStyle } from '../../../media-ui/types';
import type { CardAppearance, OnResolveCallback } from '../Card/types';

export interface CardWithDataContentProps {
  appearance: CardAppearance;
  data: JsonLd.Data.BaseData;
  onClick?: EventHandler<MouseEvent | KeyboardEvent>;
  isSelected?: boolean;
  testId?: string;
  onResolve?: OnResolveCallback;
  showActions?: boolean;
  inlinePreloaderStyle?: InlinePreloaderStyle;
}

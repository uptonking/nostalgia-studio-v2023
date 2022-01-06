import type { EventHandler, KeyboardEvent, MouseEvent } from 'react';

import type { InlinePreloaderStyle } from '../../../media-ui/types';
import type { AnalyticsHandler } from '../../utils/types';
import type {
  CardAppearance,
  CardPlatform,
  OnResolveCallback,
} from '../Card/types';

export type CardWithUrlContentProps = {
  id: string;
  url: string;
  appearance: CardAppearance;
  platform?: CardPlatform;
  onClick?: EventHandler<MouseEvent | KeyboardEvent>;
  isSelected?: boolean;
  isFrameVisible?: boolean;
  container?: HTMLElement;
  dispatchAnalytics: AnalyticsHandler;
  testId?: string;
  onResolve?: OnResolveCallback;
  showActions?: boolean;
  inheritDimensions?: boolean;
  embedIframeRef?: React.Ref<HTMLIFrameElement>;
  inlinePreloaderStyle?: InlinePreloaderStyle;
};

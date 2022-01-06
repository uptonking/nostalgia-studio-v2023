import type { EventHandler, KeyboardEvent, MouseEvent } from 'react';

import type { InlinePreloaderStyle } from '../../../media-ui/types';
import type { CardProviderRenderers } from '../../state/context/types';
import type { CardState } from '../../state/types';

export type InlineCardProps = {
  url: string;
  cardState: CardState;
  handleAuthorize: (() => void) | undefined;
  handleFrameClick: EventHandler<MouseEvent | KeyboardEvent>;
  isSelected?: boolean;
  testId?: string;
  onResolve?: (data: { url?: string; title?: string }) => void;
  inlinePreloaderStyle?: InlinePreloaderStyle;
  renderers?: CardProviderRenderers;
};

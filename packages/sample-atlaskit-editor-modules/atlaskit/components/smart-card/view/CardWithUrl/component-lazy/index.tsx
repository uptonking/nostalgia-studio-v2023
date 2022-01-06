import React from 'react';

import { isIntersectionObserverSupported } from '../../../../media-ui';
import { CardWithUrlContentProps } from '../types';
import { LazyIntersectionObserverCard } from './LazyIntersectionObserverCard';
import { LazyLazilyRenderCard } from './LazyLazilyRenderCard';

export function LazyCardWithUrlContent(props: CardWithUrlContentProps) {
  if (isIntersectionObserverSupported()) {
    return <LazyIntersectionObserverCard {...props} />;
  } else {
    return <LazyLazilyRenderCard {...props} />;
  }
}

import { useState } from 'react';

import cx from 'clsx';

import {
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
} from '@ariakit/react-core/utils/hooks';
import {
  createComponent,
  createElement,
  createHook,
} from '@ariakit/react-core/utils/system';
import {
  type As,
  type Options,
  type Props,
} from '@ariakit/react-core/utils/types';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { type DisclosureStore } from './types';

type TransitionState = 'enter' | 'leave' | null;

function afterTimeout(timeoutMs: number, cb: () => void) {
  const timeoutId = setTimeout(cb, timeoutMs);
  return () => clearTimeout(timeoutId);
}

function afterPaint(cb: () => void) {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(cb);
  });
  return () => cancelAnimationFrame(raf);
}

function parseCSSTime(...times: string[]) {
  return times
    .join(', ')
    .split(', ')
    .reduce((longestTime, currentTimeString) => {
      const currentTime = parseFloat(currentTimeString || '0s') * 1000;
      // When multiple times are specified, we want to use the longest one so we
      // wait until the longest transition has finished.
      if (currentTime > longestTime) return currentTime;
      return longestTime;
    }, 0);
}

export function isHidden(
  mounted: boolean,
  hidden?: boolean | null,
  alwaysVisible?: boolean | null,
) {
  return !alwaysVisible && hidden !== false && (!mounted || Boolean(hidden));
}

/**
 * Returns props to create a `DislosureContent` component.
 */
export const useDisclosureContent = createHook<DisclosureContentOptions>(
  ({ store, alwaysVisible, ...props }) => {
    const id = useId(props.id);
    const [transition, setTransition] = useState<TransitionState>(null);
    const open = store.useState('open');
    const mounted = store.useState('mounted');
    const animated = store.useState('animated');
    const contentElement = store.useState('contentElement');

    useSafeLayoutEffect(() => {
      if (!animated) return;
      // When the disclosure content element is rendered in a portal, we need to
      // wait for the portal to be mounted and connected to the DOM before we
      // can start the animation.
      if (!contentElement?.isConnected) {
        setTransition(null);
        return;
      }
      // Double requestAnimationFrame is necessary here to avoid potential bugs
      // when the data attribute is added before the element is fully rendered
      // in the DOM, which wouldn't trigger the animation.
      return afterPaint(() => {
        setTransition(open ? 'enter' : 'leave');
      });
    }, [animated, contentElement, open]);

    useSafeLayoutEffect(() => {
      if (!animated) return;
      if (!contentElement) return;
      if (!transition) return;
      if (transition === 'enter' && !open) return;
      if (transition === 'leave' && open) return;
      // When the animated state is a number, the user has manually set the
      // animation timeout, so we just respect it.
      if (typeof animated === 'number') {
        const timeoutMs = animated;
        return afterTimeout(timeoutMs, store.stopAnimation);
      }
      // Otherwise, we need to parse the CSS transition/animation duration and
      // delay to know when the animation ends. This is safer than relying on
      // the transitionend/animationend events because it's not guaranteed that
      // these events will fire. For example, if the element is removed from the
      // DOM before the animation ends or if the animation wasn't triggered in
      // the first place, the events won't fire.
      const {
        transitionDuration,
        animationDuration,
        transitionDelay,
        animationDelay,
      } = getComputedStyle(contentElement);
      const delay = parseCSSTime(transitionDelay, animationDelay);
      const duration = parseCSSTime(transitionDuration, animationDuration);
      const timeoutMs = delay + duration;
      // If the animation/transition delay and duration are 0, this means the
      // element is not animated with CSS (they may be using framer-motion,
      // react-spring, or something else). In this case, the user is responsible
      // for calling `stopAnimation` when the animation ends.
      if (!timeoutMs) return;
      // TODO: We should probably warn if `stopAnimation` hasn't been called
      // after X seconds.
      return afterTimeout(timeoutMs, store.stopAnimation);
    }, [animated, contentElement, open, transition]);

    const hidden = isHidden(mounted, props.hidden, alwaysVisible);
    const style = hidden ? { ...props.style, display: 'none' } : props.style;

    props = {
      id,
      'data-enter': transition === 'enter' ? '' : undefined,
      'data-leave': transition === 'leave' ? '' : undefined,
      hidden,
      ...props,
      ref: useMergeRefs(id ? store.setContentElement : null, props.ref),
      style,
    };

    return props;
  },
);

/**
 * Renders an element that can be shown or hidden.
 */
export const DisclosureContent = createComponent<DisclosureContentOptions>(
  (props) => {
    const { children, className } = props;

    const htmlProps = useDisclosureContent(props);
    return createElement('div', {
      ...htmlProps,
      className: cx(rootCss, className),
    });
  },
);

if (process.env.NODE_ENV !== 'production') {
  DisclosureContent.displayName = 'DisclosureContent';
}

export interface DisclosureContentOptions<T extends As = 'div'>
  extends Options<T> {
  /**
   * Object returned by the `useDisclosureStore` hook.
   */
  store: DisclosureStore;
  /**
   * Determines whether the content element should remain visible even when the
   * `open` state is `false`. If this prop is set to `true`, the `hidden` prop
   * and the `display: none` style will not be applied, unless explicitly set
   * otherwise.
   *
   * This prop is particularly useful when using third-party animation libraries
   * such as Framer Motion or React Spring, where the element needs to be
   * visible for exit animations to work.
   *
   * @default false
   */
  alwaysVisible?: boolean;
}

export type DisclosureContentProps<T extends As = 'div'> = Props<
  DisclosureContentOptions<T>
>;

const rootCss = css`
  /* display: flex; */
  /* justify-content: space-between; */
  min-width: ${themed.spacing.rem.n52};
  min-height: ${themed.spacing.rem.n32};
  padding-left: ${themed.spacing.rem.n3};
  padding-top: ${themed.spacing.rem.n2};
  padding-bottom: ${themed.spacing.rem.n2};
  color: ${themed.palette.slate700};
  font-size: ${themed.font.size.sm};
  line-height: ${themed.size.lineHeight.rem.n5};
`;

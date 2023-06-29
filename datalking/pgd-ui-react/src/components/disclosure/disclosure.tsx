import { type MouseEvent, useEffect, useRef, useState } from 'react';

import cx from 'clsx';

import { useButton } from '@ariakit/react-core/button/button';
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
} from '@ariakit/react-core/utils/hooks';
import {
  createComponent,
  createElement,
  createHook,
} from '@ariakit/react-core/utils/system';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { useDisclosureStore } from './api-hooks';
import { type DisclosureOptions } from './types';

/**
 * Returns props to create a `Disclosure` component.
 */
export const useDisclosure = createHook<DisclosureOptions>(
  ({ store, toggleOnClick = true, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [expanded, setExpanded] = useState(false);
    const disclosureElement = store.useState('disclosureElement');
    const open = store.useState('open');

    // Assigns the disclosure element whenever it's undefined or disconnected
    // from the DOM. If the current element is the disclosure element, it will
    // get the `aria-expanded` attribute set to `true` when the disclosure
    // content is open.
    useEffect(() => {
      let isCurrentDisclosure = disclosureElement === ref.current;
      if (!disclosureElement || !disclosureElement.isConnected) {
        store.setDisclosureElement(ref.current);
        isCurrentDisclosure = true;
      }
      setExpanded(open && isCurrentDisclosure);
    }, [disclosureElement, open, store]);

    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      store.setDisclosureElement(event.currentTarget);
      onMouseDownProp?.(event);
    });

    const onClickProp = props.onClick;
    const toggleOnClickProp = useBooleanEvent(toggleOnClick);
    const isDuplicate = 'data-disclosure' in props;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      store.setDisclosureElement(event.currentTarget);
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (!toggleOnClickProp(event)) return;
      store.toggle();
    });

    const contentElement = store.useState('contentElement');

    props = {
      'data-disclosure': '',
      'aria-expanded': expanded,
      'aria-controls': contentElement?.id,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseDown,
      onClick,
    };

    props = useButton(props);

    return props;
  },
);

/**
 * Renders an element that controls the visibility of a disclosure content element.
 */
export const Disclosure = createComponent<DisclosureOptions>((props) => {
  const { startIcon, endIcon, ...props_ } = props;
  const { children, className } = props;

  const htmlProps = useDisclosure(props_);

  if (!startIcon && !endIcon) {
    return createElement('button', {
      ...htmlProps,
      className: cx(rootCss, className),
    });
  }

  return createElement('button', {
    ...htmlProps,
    className: cx(rootCss, className),
  });
});

if (process.env.NODE_ENV !== 'production') {
  Disclosure.displayName = 'Disclosure';
}

const rootCss = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: ${themed.spacing.rem.n52};
  padding-left: ${themed.spacing.rem.n2half};
  padding-right: ${themed.spacing.rem.n2half};
  padding-top: ${themed.spacing.rem.n2};
  padding-bottom: ${themed.spacing.rem.n2};
  border: none;
  background-color: ${themed.palette.gray100};
  /* color: ${themed.palette.slate700}; */
  /* font-size: ${themed.font.size.sm}; */
  /* line-height: ${themed.size.lineHeight.rem.n5}; */

  cursor: pointer;

  &:hover {
    /* background-color: ${themed.palette.gray100}; */
  }
`;

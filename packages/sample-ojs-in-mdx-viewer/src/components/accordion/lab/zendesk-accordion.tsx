import classNames from 'clsx';
import * as React from 'react';
import { useRef } from 'react';

import { useLocale } from '@react-aria/i18n';
import { useHover } from '@react-aria/interactions';
import { filterDOMProps, mergeProps } from '@react-aria/utils';
import { useProviderProps } from '@react-spectrum/provider';
import { useDOMRef, useStyleProps } from '@react-spectrum/utils';
import { TreeState, useTreeState } from '@react-stately/tree';
import type { DOMRef, Node } from '@react-types/shared';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';

import { SpectrumAccordionProps } from '../src/types';
import { useAccordion, useAccordionItem } from '../src/useAccordion';

const styles = { className: '' };

function Accordion<T extends object>(
  props: SpectrumAccordionProps<T>,
  ref: DOMRef<HTMLDivElement>,
) {
  console.log(';;pp4-Accordion, ', props);

  // debugger;

  props = useProviderProps(props);
  let domRef = useDOMRef(ref);
  let state = useTreeState<T>(props);

  console.log(';;Accordion-state, ', state);

  let { styleProps } = useStyleProps(props);
  let { accordionProps } = useAccordion(props, state, domRef);

  return (
    <div
      {...filterDOMProps(props)}
      {...accordionProps}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, '', styleProps.className)}
    >
      {[...state.collection].map((item) => (
        <AccordionItem<T> key={item.key} item={item} state={state} />
      ))}
    </div>
  );
}

interface AccordionItemProps<T> {
  item: Node<T>;
  state: TreeState<T>;
}

function AccordionItem<T>(props: AccordionItemProps<T>) {
  // console.log('==pp4=AccordionItem, ', props);

  props = useProviderProps(props);
  let ref = useRef<HTMLButtonElement>();
  let { state, item } = props;
  let { buttonProps, regionProps } = useAccordionItem<T>(props, state, ref);
  let isOpen = state.expandedKeys.has(item.key);
  let isDisabled = state.disabledKeys.has(item.key);
  let { isHovered, hoverProps } = useHover({ isDisabled });
  let { direction } = useLocale();

  console.log(';;item-isOpen, ', isOpen, item);

  return (
    <div
      // style={{ borderBottom: '1px solid silver' }}
      className={classNames(styles, 'spectrum-Accordion-item', {
        'is-open': isOpen,
        'is-disabled': isDisabled,
      })}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between' }}
        className={classNames(styles, '')}
      >
        <h4>{item.props.title}</h4>

        <button
          {...mergeProps(buttonProps, hoverProps)}
          ref={ref}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
          className={classNames(styles, '', {
            'is-hovered': isHovered,
          })}
        >
          {direction === 'ltr' ? (
            <ChevronRightMedium
              aria-hidden='true'
              UNSAFE_className={classNames(styles, '')}
            />
          ) : (
            <ChevronLeftMedium
              aria-hidden='true'
              UNSAFE_className={classNames(styles, '')}
            />
          )}
        </button>
      </div>
      <div
        {...regionProps}
        className={classNames(styles, 'spectrum-Accordion-itemContent')}
      >
        {item.props.children}
      </div>
    </div>
  );
}

const _Accordion = React.forwardRef(Accordion);
export { _Accordion as ZendeskAccordion };

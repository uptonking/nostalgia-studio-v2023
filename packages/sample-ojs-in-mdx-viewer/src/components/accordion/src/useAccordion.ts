import { ButtonHTMLAttributes, HTMLAttributes, RefObject } from 'react';

import { useButton } from '@react-aria/button';
import { useSelectableItem, useSelectableList } from '@react-aria/selection';
import { mergeProps, useId } from '@react-aria/utils';
import { TreeState } from '@react-stately/tree';
import type { Node } from '@react-types/shared';

import { AriaAccordionProps } from './types';

interface AccordionAria {
  accordionProps: HTMLAttributes<HTMLElement>;
}
interface AccordionItemAriaProps<T> {
  item: Node<T>;
}

interface AccordionItemAria {
  /** Props for the accordion item button. */
  buttonProps: ButtonHTMLAttributes<HTMLElement>;
  /** Props for the accordion item content element. */
  regionProps: HTMLAttributes<HTMLElement>;
}

export function useAccordionItem<T>(
  props: AccordionItemAriaProps<T>,
  state: TreeState<T>,
  ref: RefObject<HTMLButtonElement>,
): AccordionItemAria {
  let { item } = props;
  let buttonId = useId();
  let regionId = useId();
  let isDisabled = state.disabledKeys.has(item.key);
  let { itemProps } = useSelectableItem({
    selectionManager: state.selectionManager,
    key: item.key,
    ref,
  });
  let { buttonProps } = useButton(
    mergeProps(itemProps as any, {
      id: buttonId,
      elementType: 'button',
      isDisabled,
      onPress: () => state.toggleKey(item.key),
    }),
    ref,
  );
  let isExpanded = state.expandedKeys.has(item.key);
  return {
    buttonProps: {
      ...buttonProps,
      'aria-expanded': isExpanded,
      'aria-controls': isExpanded ? regionId : undefined,
    },
    regionProps: {
      id: regionId,
      role: 'region',
      'aria-labelledby': buttonId,
    },
  };
}

export function useAccordion<T>(
  props: AriaAccordionProps<T>,
  state: TreeState<T>,
  ref: RefObject<HTMLDivElement>,
): AccordionAria {
  let { listProps } = useSelectableList({
    ...props,
    ...state,
    allowsTabNavigation: true,
    ref,
  });
  return {
    accordionProps: {
      ...listProps,
      tabIndex: undefined,
    },
  };
}

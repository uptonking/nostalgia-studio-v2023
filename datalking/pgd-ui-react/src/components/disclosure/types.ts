import type React from 'react';
import { type MouseEvent } from 'react';

import type * as Core from '@ariakit/core/disclosure/disclosure-store';
import { type BooleanOrCallback } from '@ariakit/core/utils/types';
import { type ButtonOptions } from '@ariakit/react-core/button/button';
import { type Store } from '@ariakit/react-core/utils/store';
import { type As, type Props } from '@ariakit/react-core/utils/types';

export type DisclosureStoreState = Core.DisclosureStoreState;

export type DisclosureStoreFunctions = Core.DisclosureStoreFunctions;

export interface DisclosureStoreOptions extends Core.DisclosureStoreOptions {
  /**
   * A callback that gets called when the `open` state changes.
   * @param open The new open value.
   * @example
   * const [open, setOpen] = useState(false);
   * const disclosure = useDisclosureStore({ open, setOpen });
   */
  setOpen?: (open: DisclosureStoreState['open']) => void;
}

export type DisclosureStoreProps = DisclosureStoreOptions &
  Core.DisclosureStoreProps;

/** disclosure store */
export type DisclosureStore = DisclosureStoreFunctions &
  Store<Core.DisclosureStore>;

export interface DisclosureOptions<T extends As = 'button'>
  extends ButtonOptions<T> {
  /**
   * Object returned by the `useDisclosureStore` hook.
   */
  store: DisclosureStore;
  /**
   * Determines whether `store.toggle()` will be called on click. This is useful
   * if you want to handle the toggle logic yourself.
   * @default true
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;

  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export type DisclosureProps<T extends As = 'button'> = Props<
  DisclosureOptions<T>
>;

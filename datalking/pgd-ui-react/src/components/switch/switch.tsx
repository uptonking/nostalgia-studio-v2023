import React, {
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  type CommandOptions,
  useCommand,
} from '@ariakit/react-core/command/command';
import {
  useEvent,
  useMergeRefs,
  useTagName,
  useWrapElement,
} from '@ariakit/react-core/utils/hooks';
import { useStoreState } from '@ariakit/react-core/utils/store';
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

import { type SwitchStore, SwitchStoreContext } from './api-hooks';

function getNonArrayValue<T>(value: T) {
  if (Array.isArray(value)) {
    return value.toString();
  }
  return value as Exclude<T, readonly any[]>;
}

function checkIsNativeSwitch(tagName?: string, type?: string) {
  return tagName === 'input' && (!type || type === 'checkbox');
}

/**
 * - switch vs checkbox:
 *   - checkbox supports 3 states on/off/indeterminate, while switch only on/off
 *   - switch supports swipe gesture
 *   - switch generally takes more visual space, and can have complex styling
 * - https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
export const SwitchUnstyled = createComponent<SwitchOptions>((props) => {
  const htmlProps = useSwitch(props);
  return createElement('input', htmlProps);
});

if (process.env.NODE_ENV !== 'production') {
  SwitchUnstyled.displayName = 'SwitchUnstyled';
}

/**
 * Returns props to create a `Switch` component.
 */
export const useSwitch = createHook<SwitchOptions>(
  ({
    store,
    value: valueProp,
    checked: checkedProp,
    defaultChecked,
    ...props
  }) => {
    const storeChecked = useStoreState(store, (state) => {
      if (checkedProp !== undefined) return checkedProp;
      if (state.value === undefined) return undefined;
      if (valueProp != null) {
        if (Array.isArray(state.value)) {
          const nonArrayValue = getNonArrayValue(valueProp);
          return state.value.includes(nonArrayValue);
        }
        return state.value === valueProp;
      }
      if (Array.isArray(state.value)) return false;
      if (typeof state.value === 'boolean') return state.value;
      return false;
    });

    const [_checked, setChecked] = useState(defaultChecked ?? false);
    const checked = checkedProp ?? storeChecked ?? _checked;

    const ref = useRef<HTMLInputElement>(null);
    const tagName = useTagName(ref, props.as || 'input');
    const isNativeSwitch = checkIsNativeSwitch(tagName, props.type);
    const isChecked = checked;

    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      element.checked = isChecked;
    }, [isChecked]);

    const onChangeProp = props.onChange;

    const onChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
      if (props.disabled) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
      if (!isNativeSwitch) {
        // If not a native checkbox, we need to manually update its checked property.
        event.currentTarget.checked = !event.currentTarget.checked;
      }
      onChangeProp?.(event);
      if (event.defaultPrevented) return;

      const elementChecked = event.currentTarget.checked;
      setChecked(elementChecked);

      store?.setValue((prevValue) => {
        if (valueProp == null) return elementChecked;
        const nonArrayValue = getNonArrayValue(valueProp);
        if (!Array.isArray(prevValue)) {
          return prevValue === nonArrayValue ? false : nonArrayValue;
        }
        if (elementChecked) return [...prevValue, nonArrayValue];
        return prevValue.filter((v) => v !== nonArrayValue);
      });
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLInputElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isNativeSwitch) return;
      // @ts-expect-error The onChange event expects a ChangeEvent, but here we
      // need to pass a MouseEvent.
      onChange(event);
    });

    props = useWrapElement(
      props,
      (element) => (
        <SwitchStoreContext.Provider value={isChecked}>
          {element}
        </SwitchStoreContext.Provider>
      ),
      [isChecked],
    );

    props = {
      role: 'switch',
      type: isNativeSwitch ? 'checkbox' : undefined,
      'aria-checked': checked,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onChange,
      onClick,
    };

    props = useCommand({ clickOnEnter: !isNativeSwitch, ...props });

    return {
      value: isNativeSwitch ? valueProp : undefined,
      checked: isChecked,
      ...props,
    };
  },
);

export interface SwitchOptions<T extends As = 'input'>
  extends CommandOptions<T> {
  /**
   * Object returned by the `useSwitchStore` hook. If not provided, the
   * internal store will be used.
   *
   */
  store?: SwitchStore;
  /**
   * The value of the switch. This is useful when the same checkbox store is
   * used for multiple `Switch` elements, in which case the value will be an
   * array of checked values.
   *
   * Switch group examples:
   * @example
   * ```jsx
   * const switch = useCheckboxStore({
   *   defaultValue: ["Apple", "Orange"],
   * });
   * <Checkbox store={switch} value="Apple" />
   * <Checkbox store={switch} value="Orange" />
   * <Checkbox store={switch} value="Watermelon" />
   * ```
   */
  value?: InputHTMLAttributes<HTMLInputElement>['value'];
  /**
   * The default `checked` state of the switch. This prop is ignored if the
   * `checked` or the `store` props are provided.
   */
  defaultChecked?: boolean;
  /**
   * The `checked` state of the switch. This will override the value inferred
   * from `store` prop, if provided.
   *
   */
  checked?: boolean;
  /**
   * A function that is called when the switch's `checked` store changes.
   *
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  /** if true, user must check the switch before the owning form can be submitted */
  required?: boolean;
  /** if true, prevents the user from interacting with the switch */
  disabled?: boolean;
  /** useful when submiting within form */
  name?: string;
}

export type SwitchProps<T extends As = 'input'> = Props<SwitchOptions<T>>;

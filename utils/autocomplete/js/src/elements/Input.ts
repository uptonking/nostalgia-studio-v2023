import {
  type AutocompleteApi as AutocompleteCoreApi,
  type AutocompleteEnvironment,
  type AutocompleteScopeApi,
} from '@algolia/autocomplete-core';

import { getCreateDomElement } from '../getCreateDomElement';
import { type AutocompletePropGetters, type AutocompleteState } from '../types';
import { type AutocompleteElement } from '../types/AutocompleteElement';
import { setProperties } from '../utils';

type InputProps = {
  autocompleteScopeApi: AutocompleteScopeApi<any>;
  environment: AutocompleteEnvironment;
  getInputProps: AutocompletePropGetters<any>['getInputProps'];
  getInputPropsCore: AutocompleteCoreApi<any>['getInputProps'];
  isDetached: boolean;
  state: AutocompleteState<any>;
};

export const Input: AutocompleteElement<InputProps, HTMLInputElement> = ({
  autocompleteScopeApi,
  environment,
  classNames,
  getInputProps,
  getInputPropsCore,
  isDetached,
  state,
  ...props
}) => {
  const createDomElement = getCreateDomElement(environment);
  const element = createDomElement('input', props);
  const inputProps = getInputProps({
    state,
    props: getInputPropsCore({ inputElement: element }),
    inputElement: element,
    ...autocompleteScopeApi,
  });

  setProperties(element, {
    ...inputProps,
    onKeyDown(event: KeyboardEvent) {
      // In detached mode we don't want to close the panel when hitting `Tab`.
      if (isDetached && event.key === 'Tab') {
        return;
      }

      inputProps.onKeyDown(event);
    },
  });

  return element;
};

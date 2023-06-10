import * as React from 'react';
import { useMemo } from 'react';
import { type MenuItemProps } from './types';
import { useMenuItem } from './useMenuItem';

export function MenuItem<
  E extends HTMLElement = HTMLDivElement,
  D = any | undefined,
>({ renderItem, ...menuItemProps }: MenuItemProps<E, D>) {
  const { renderProps } = useMenuItem<E, D>({
    ...menuItemProps,
    updateSearchLabelDeps: [renderItem],
  });

  return useMemo(() => {
    return renderItem(renderProps);
  }, [renderProps, renderItem]);
}

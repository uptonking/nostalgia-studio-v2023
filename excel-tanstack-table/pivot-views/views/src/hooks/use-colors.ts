import { useMemo } from 'react';

import { useEgoUITheme } from '@datalking/pivot-ui';

export const useColors = () => {
  const theme = useEgoUITheme();

  return useMemo(
    () => Object.values(theme.colors).flatMap((color) => color),
    [],
  );
};

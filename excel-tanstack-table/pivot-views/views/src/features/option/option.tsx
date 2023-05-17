import React from 'react';

import type {
  IOptionColorName,
  IOptionColorShade,
} from '@datalking/pivot-core';
import type { BadgeProps } from '@datalking/pivot-ui';
import { Badge } from '@datalking/pivot-ui';

interface IProps {
  colorName: IOptionColorName;
  shade: IOptionColorShade;
  name: string;
}

export const Option: React.FC<IProps> = ({
  colorName,
  name,
  shade,
  ...rest
}) => {
  const color = `${colorName}.${shade}`;
  const variant: BadgeProps['variant'] = shade < 5 ? 'light' : 'filled';
  return (
    <Badge<'span'>
      component='span'
      {...rest}
      radius='xs'
      bg={color}
      variant={variant}
      styles={{
        root: {
          textTransform: 'unset',
        },
      }}
    >
      {name}
    </Badge>
  );
};

import { styled } from '@linaria/react';

import { IconButton } from '../../../../src/components';
import { themed } from '../../../../src/styles';

export const ToolbarBtnActiveClassName = 'isToolbarBtnActive';

export const ToolbarButton = styled(IconButton)`
  ${'&.' + ToolbarBtnActiveClassName} {
    background-color: ${themed.color.brand.lighter};
  }
`;

import { styled } from '@linaria/react';

import { IconButton } from '../../../src/components';
import { themed } from '../../../src/styles';

export const ToolbarButton = styled(IconButton) <{ isActive?: boolean }>`
  &.isToolbarBtnActive {
    background-color: ${themed.color.brand.lighter};
  }
`;

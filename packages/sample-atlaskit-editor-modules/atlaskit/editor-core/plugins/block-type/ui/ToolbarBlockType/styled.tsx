import React, { ComponentClass, HTMLAttributes } from 'react';
import styled from 'styled-components';

import { N400 } from '@atlaskit/theme/colors';

import { headingsSharedStyles } from '../../../../../editor-common';
import { Shortcut } from '../../../../ui/styles';

export const BlockTypeMenuItem = styled.div<{
  tagName: string;
  selected?: boolean;
}>`
  ${headingsSharedStyles};
  > {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
    }
  }
  ${(props) => (props.selected ? `${props.tagName} { color: white }` : '')};
`;

export const KeyboardShortcut = styled(Shortcut)<any>`
  ${(props) => (props.selected ? `color: ${N400};` : '')}
  margin-left: 16px;
`;

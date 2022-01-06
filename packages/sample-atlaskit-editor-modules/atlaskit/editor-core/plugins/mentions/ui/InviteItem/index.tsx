import React, {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
} from 'react';
import { FormattedMessage } from 'react-intl';

import AddIcon from '@atlaskit/icon/glyph/add';
import { N300 } from '@atlaskit/theme/colors';

import { UserRole } from '../../../../../components/mention';
import { MentionDescription } from '../../../../../components/mention/resource';
import { messages } from '../../messages';
import {
  AvatarStyle,
  CapitalizedStyle,
  MentionItemStyle,
  NameSectionStyle,
  RowStyle,
} from './styles';

export interface OnMentionEvent {
  (mention: MentionDescription, event?: SyntheticEvent<any>): void;
}

export const INVITE_ITEM_DESCRIPTION = { id: 'invite-teammate' };

const leftClick = (event: MouseEvent<any>): boolean => {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
};

export interface Props {
  productName?: string;
  onMount?: () => void;
  onMouseEnter?: OnMentionEvent;
  onSelection?: OnMentionEvent;
  selected?: boolean;
  userRole?: UserRole;
}

const InviteItem = ({
  productName,
  onMount,
  onMouseEnter,
  onSelection,
  selected,
  userRole,
}: Props) => {
  const onSelected = useCallback(
    (event: React.MouseEvent<any>) => {
      if (leftClick(event) && onSelection) {
        event.preventDefault();
        onSelection(INVITE_ITEM_DESCRIPTION, event);
      }
    },
    [onSelection],
  );

  const onItemMouseEnter = useCallback(
    (event: React.MouseEvent<any>) => {
      if (onMouseEnter) {
        onMouseEnter(INVITE_ITEM_DESCRIPTION, event);
      }
    },
    [onMouseEnter],
  );

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  return (
    <MentionItemStyle
      selected={selected}
      onMouseDown={onSelected}
      onMouseEnter={onItemMouseEnter}
      data-id={INVITE_ITEM_DESCRIPTION.id}
    >
      <RowStyle>
        <AvatarStyle>
          <AddIcon label='add-icon' primaryColor={N300} />
        </AvatarStyle>
        <NameSectionStyle>
          <FormattedMessage
            {...messages.inviteItemTitle}
            values={{
              userRole: userRole || 'basic',
              productName: <CapitalizedStyle>{productName}</CapitalizedStyle>,
            }}
          />
        </NameSectionStyle>
      </RowStyle>
    </MentionItemStyle>
  );
};

export default InviteItem;

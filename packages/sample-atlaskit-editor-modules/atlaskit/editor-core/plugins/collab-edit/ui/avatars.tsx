import React from 'react';

import AvatarGroup from '@atlaskit/avatar-group';

import { ReadOnlyParticipants } from '../participants';
import { CollabParticipant } from '../types';
import { AvatarContainer } from './styles';
import toAvatar from './to-avatar';

export interface AvatarsProps {
  sessionId?: string;
  participants: ReadOnlyParticipants;
}

export const Avatars: React.FunctionComponent<AvatarsProps> = React.memo(
  (props) => {
    const { sessionId } = props;
    const participants = props.participants.toArray() as CollabParticipant[];
    const avatars = participants
      .sort((p) => (p.sessionId === sessionId ? -1 : 1))
      .map(toAvatar);

    if (!avatars.length) {
      return null;
    }

    return (
      <AvatarContainer>
        <AvatarGroup
          appearance='stack'
          size='medium'
          data={avatars}
          maxCount={3}
        />
        {props.children}
      </AvatarContainer>
    );
  },
);

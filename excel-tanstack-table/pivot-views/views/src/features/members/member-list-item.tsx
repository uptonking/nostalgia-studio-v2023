import React from 'react';

import { t } from 'i18next';

import type { IQueryUser } from '@datalking/pivot-core';
import {
  getAuthStatus,
  getAuthToken,
  getIsAuthorized,
  useMeQuery,
} from '@datalking/pivot-store';
import { Avatar, Badge, Box, Group, Paper, Text } from '@datalking/pivot-ui';

import { useAppSelector } from '../../hooks';

interface IProps {
  member: IQueryUser;
}

export const MemberListItem = ({ member }) => {
  // const authToken = useAppSelector(getAuthToken);

  const { data } = useMeQuery();
  const isMe = member.userId === data?.me.userId;

  return (
    <Paper p='lg' shadow='xs' radius='md'>
      <Group position='apart'>
        <Group>
          <Avatar src={member.avatar}>{member.username.slice(0, 2)}</Avatar>

          <Box>
            <Text>{member.username}</Text>
            <Text size='xs' color='gray'>
              {member.email}
            </Text>
          </Box>
        </Group>

        {isMe && <Badge>{t('You', { ns: 'common' })}</Badge>}
      </Group>
    </Paper>
  );
};

import React from 'react';

import {
  getAuthStatus,
  getAuthToken,
  getIsAuthorized,
  useMeQuery,
} from '@datalking/pivot-store';
import { Box, Container } from '@datalking/pivot-ui';

import { Header } from '../features/header/header';
import { MemberProfile } from '../features/profile/member-profile';
import { useAppSelector } from '../hooks';

export const MyProfile = () => {
  // const authToken = useAppSelector(getAuthToken);

  const me = useMeQuery();

  if (!me.data) return null;

  return (
    <Box h='100vh' bg='gray.0'>
      <Header />
      <Container pt='xl'>
        <MemberProfile member={me.data.me} />
      </Container>
    </Box>
  );
};

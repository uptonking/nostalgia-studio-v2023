import React from 'react';

import { Group, Skeleton } from '@datalking/pivot-ui';

export const TableLoading = () => {
  return (
    <Group fz='md' p='md'>
      <Skeleton h='30px' />
      <Skeleton h='30px' />
      <Skeleton h='calc(100vh - 60px)' />
    </Group>
  );
};

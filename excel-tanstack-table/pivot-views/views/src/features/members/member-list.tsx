import { useTranslation } from 'react-i18next';

import { useGetUsersQuery } from '@datalking/pivot-store';
import {
  Skeleton,
  Space,
  Stack,
  Title,
  useDebouncedValue,
} from '@datalking/pivot-ui';

import { MemberListItem } from './member-list-item';

export const MemberList: React.FC = () => {
  const { data, isLoading } = useGetUsersQuery({});
  const { t } = useTranslation();

  const [debouncedIsLoading] = useDebouncedValue(isLoading, 200);

  return (
    <>
      <Title order={3}>{t('Members', { ns: 'common' })}</Title>

      <Space my='xl' />

      <Stack>
        {debouncedIsLoading ? (
          <>
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
            <Skeleton h={40} />
          </>
        ) : (
          data?.ids.map((id) => (
            <MemberListItem key={id} member={data.entities[id]!} />
          ))
        )}
      </Stack>
    </>
  );
};

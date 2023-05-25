import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { getMe, getMeData, logout } from '@datalking/pivot-store';
import {
  ActionIcon,
  Avatar,
  Button,
  Center,
  Divider,
  Group,
  IconLanguage,
  IconLogout,
  IconUsersGroup,
  Image,
  Menu,
  Text,
} from '@datalking/pivot-ui';

import logo from '../../assets/watarble-logo.svg';
import { useAppSelector } from '../../hooks';

/** app top header navbar */
export const Header = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const language = i18n.language;

  const dispatch = useDispatch();
  const userData = useAppSelector(getMe);
  // console.log(';; meData ', userData);

  return (
    <Group
      px='xs'
      h={50}
      bg='white'
      py={6}
      sx={(theme) => ({ borderBottom: '1px solid ' + theme.colors.gray[3] })}
      position='apart'
    >
      <Center>
        <Link
          to='/'
          style={{
            display: 'flex',
            textDecorationLine: 'none',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <Image src={logo} alt='watarble' width='32px' height='32px' />
          <Text pl='xs' color='blue.9' fw={600}>
            watarble
          </Text>
        </Link>
      </Center>

      <Center mr='lg'>
        <Link to='/members'>
          <Button
            compact
            size='sm'
            color='gray'
            variant='subtle'
            leftIcon={<IconUsersGroup size={16} />}
          >
            {t('Members', { ns: 'common' })}
          </Button>
        </Link>
        <Divider mx={20} size='xs' orientation='vertical' />
        <Menu>
          <Menu.Target>
            <ActionIcon>
              <IconLanguage />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              fw={language === 'zh-CN' ? 600 : 'normal'}
              onClick={() => i18n.changeLanguage('zh-CN')}
            >
              简体中文
            </Menu.Item>
            <Menu.Item
              fw={language === 'en' ? 600 : 'normal'}
              onClick={() => i18n.changeLanguage('en')}
            >
              English
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {userData && (
          <Menu width={200}>
            <Menu.Target>
              <Avatar
                radius='xl'
                ml='sm'
                role='button'
                sx={{ cursor: 'pointer' }}
              >
                {userData.username.slice(0, 2).toUpperCase()}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Link to='/me/profile'>
                <Menu.Item fw={600}>
                  <Group spacing='xs'>
                    <Avatar size='xs' src={userData.avatar}>
                      {userData.username.slice(0, 2)}
                    </Avatar>
                    {userData.username}
                  </Group>
                </Menu.Item>
              </Link>
              <Menu.Divider />
              <Menu.Item
                icon={<IconLogout size={16} />}
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                }}
              >
                {t('logout', { ns: 'auth' })}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Center>
    </Group>
  );
};

import React from 'react';

import { useStore } from '@nanostores/react';

import SettingsIcon from '../icons/settings.svg';
import { isMenuOpen, toggleMenu } from '../store/settingsStore';
import {
  HeaderDecoration,
  HeaderTitle,
  SettingsIconWrapper,
  StyledHeader,
} from './Header.styled';

export const Header = () => {
  const isOpen = useStore(isMenuOpen);
  return (
    <StyledHeader>
      <HeaderDecoration>
        <div className='line1'></div>
        <div className='line2'></div>
      </HeaderDecoration>
      <HeaderTitle>Busy Bee</HeaderTitle>
      <SettingsIconWrapper $isOpen={isOpen}>
        <img src={SettingsIcon} onClick={toggleMenu} />
      </SettingsIconWrapper>
    </StyledHeader>
  );
};

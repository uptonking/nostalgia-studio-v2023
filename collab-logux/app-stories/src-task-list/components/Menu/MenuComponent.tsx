import React from 'react';

import { useStore } from '@nanostores/react';

import AddIcon from '../../icons/add-hexagon.svg';
import EditIcon from '../../icons/pencil.svg';
import {
  settings as settingsAtom,
  toggleFont,
} from '../../store/settingsStore';
import { ToggleComponent } from '../Common/Toggle/ToggleComponent';
import {
  IconLabel,
  IconWrapper,
  MenuCard,
  MenuItem,
  MenuWrapper,
  ToggleLabel,
} from './MenuComponent.styled';

export const MenuComponent = () => {
  const settings = useStore(settingsAtom);
  return (
    <MenuWrapper>
      <MenuCard $isOpen={settings.isOpen}>
        <MenuItem>
          <ToggleComponent
            checked={settings.useCustomFont}
            onToggle={toggleFont}
          />
          <ToggleLabel>Cursive(连笔的；草书的)</ToggleLabel>
        </MenuItem>
        {/* <MenuItem $clickable $editNote>
          <IconWrapper>
            <img src={EditIcon} />
          </IconWrapper>
          <IconLabel>Edit Note</IconLabel>
        </MenuItem>
        <MenuItem $clickable $createNote>
          <IconWrapper>
            <img src={AddIcon} />
          </IconWrapper>
          <IconLabel>New Note</IconLabel>
        </MenuItem> */}
      </MenuCard>
    </MenuWrapper>
  );
};

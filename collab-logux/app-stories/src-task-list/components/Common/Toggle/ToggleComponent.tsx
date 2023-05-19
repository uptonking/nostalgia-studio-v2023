import React from 'react';
import { ToggleWrapper } from './ToggleComponent.styled';

type ToggleComponentProps = {
  checked: boolean;
  onToggle: () => void;
};

export const ToggleComponent: React.FC<ToggleComponentProps> = ({
  checked,
  onToggle,
}) => {
  return (
    <ToggleWrapper>
      <input type='checkbox' checked={checked} onChange={onToggle} />
      <span className='slider'></span>
    </ToggleWrapper>
  );
};

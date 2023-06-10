import React, { type ChangeEventHandler } from 'react';

import { CheckboxWrapper, TextWrapper } from './Checkbox.styled';

type CheckboxProps = {
  checked: boolean;
  onToggle: ChangeEventHandler<HTMLInputElement>;
  label: string;
  id: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onToggle,
  id,
}) => {
  return (
    <CheckboxWrapper>
      <div className='checkbox'>
        <input
          type='checkbox'
          id={`todo-item=${id}`}
          className='checkbox-input'
          checked={checked}
          onChange={onToggle}
        />
        <label htmlFor={`todo-item=${id}`} className='label'>
          <svg width='40' height='40' viewBox='0 0 100 100'>
            <rect
              x='35'
              y='30'
              width='40'
              height='40'
              stroke='black'
              fill='none'
            />
            <g transform='translate(0,-952.36218)'>
              <path
                d='m 40 1001 c 1 2 11 17 13 17 m 0 0 c 13 -29 18 -41 20 -43'
                stroke='black'
                strokeWidth='3'
                className='path1'
                fill='none'
              />
            </g>
          </svg>
          <TextWrapper $done={checked}>{label}</TextWrapper>
        </label>
      </div>
    </CheckboxWrapper>
  );
};

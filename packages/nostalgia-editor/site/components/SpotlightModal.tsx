import React, { CSSProperties } from 'react';
import { AutoComplete, Typography } from 'antd';
import OutsideClickHandler from 'react-outside-click-handler';

const wrapperStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 10,
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
};

interface ISpotlightProps {
  options: { label: string; value: string; command?: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function SpotlightModal({
  options,
  onSelect,
  onClose,
}: ISpotlightProps) {
  return (
    <OutsideClickHandler onOutsideClick={onClose}>
      <div style={wrapperStyle}>
        <h1>Spotlight-Comp</h1>
        <AutoComplete
          placeholder='Command palette...'
          style={{
            width: '100%',
            boxShadow: '0px 5px 30px 0px rgba(0,0,0,0.2)',
          }}
          onSelect={onSelect}
          options={options.map((option) => {
            if (option.command) {
              return {
                label: (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {option.label}
                    <Typography.Text keyboard>{option.command}</Typography.Text>
                  </div>
                ),
                value: option.value,
              };
            }

            return option;
          })}
          optionFilterProp='label'
          filterOption
          size='large'
          defaultOpen
          autoFocus
        />
      </div>
    </OutsideClickHandler>
  );
}

import React from 'react';
import { Popup, PopupActions, type PopupProps } from 'reactjs-popup';

import { Button, Center, Content } from '../components';

const Template = (args: Omit<PopupProps, 'children'>) => (
  <Center>
    <Popup {...args}>Modal content Here</Popup>
  </Center>
);

export const SimpleTooltipApp = () => {
  const args = {
    trigger: <button> click Me to open tooltip</button>,
  };

  return <Template {...args} />;
};

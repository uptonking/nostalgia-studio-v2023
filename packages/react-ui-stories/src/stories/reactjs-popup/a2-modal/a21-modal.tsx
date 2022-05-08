import React from 'react';
import { Popup, PopupActions, PopupProps } from 'reactjs-popup';

import { Button, Center, Content } from '../components';

const Template = (args: Omit<PopupProps, 'children'>) => (
  <Center>
    <Popup {...args}>Modal content Here</Popup>
  </Center>
);

export const SimpleModalApp = () => {
  const args = {
    trigger: <button> click Me to open modal</button>,
    modal: true,
  };

  return <Template {...args} />;
};

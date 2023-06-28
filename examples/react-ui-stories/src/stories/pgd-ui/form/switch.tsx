import React from 'react';

import {
  Disclosure,
  DisclosureContent,
  DocPage,
  Switch,
  useDisclosureStore,
} from '@pgd/ui-react';

const BasicSwitch = () => {
  // const store = useDisclosureStore();

  return <Switch>toggle the wifi</Switch>;
};

const demos = [
  {
    title: 'Basic Switch',
    demo: <BasicSwitch />,
  },
];

export const C3a1Switch = () => {
  return <DocPage title='Switch/Toggle' previews={demos} />;
};

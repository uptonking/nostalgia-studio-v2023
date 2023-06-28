import React from 'react';

import { useDisclosureStore } from './api-hooks';
import { Disclosure } from './disclosure';
import { DisclosureContent } from './disclosure-content';

type DisclosureDefaultProps = {
  label?: React.ReactNode;
  content?: React.ReactNode;
  defaultOpen?: boolean;
};

const defaultProps = {
  label: 'toggle content',
  content: 'details',
  defaultOpen: true,
};

export const DisclosureDefault = (
  props: DisclosureDefaultProps = defaultProps,
) => {
  const { label, content, defaultOpen } = props;

  const store = useDisclosureStore({ defaultOpen });

  return (
    <>
      <Disclosure store={store} className='button'>
        {label}
      </Disclosure>
      <DisclosureContent store={store} className='content'>
        {content}
      </DisclosureContent>
    </>
  );
};

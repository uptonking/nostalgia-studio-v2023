import React from 'react';

import { useDisclosureStore } from './api-hooks';
import { Disclosure } from './disclosure';
import { DisclosureContent } from './disclosure-content';

type DisclosureDefaultProps = {
  label?: React.ReactNode;
  labelClassName?: string;
  content?: React.ReactNode;
  contentClassName?: string;
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
  const { label, content, defaultOpen, labelClassName, contentClassName } =
    props;

  const store = useDisclosureStore({ defaultOpen });

  return (
    <>
      <Disclosure store={store} className={labelClassName}>
        {label}
      </Disclosure>
      <DisclosureContent store={store} className={contentClassName}>
        {content}
      </DisclosureContent>
    </>
  );
};

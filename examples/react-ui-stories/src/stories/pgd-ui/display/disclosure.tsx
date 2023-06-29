import React from 'react';

import { css } from '@linaria/core';
import {
  Disclosure,
  DisclosureContent,
  DocPage,
  useDisclosureStore,
} from '@pgd/ui-react';
import { themed } from '@pgd/ui-tokens';

import { demoPreviewDefaultContainerCss } from '../../../styles';

const BasicDisclosure = () => {
  const store = useDisclosureStore();

  return (
    <div className={demoPreviewDefaultContainerCss}>
      <Disclosure store={store} className={basicDisclosureWidthCss}>
        What are vegetables?
      </Disclosure>
      <DisclosureContent store={store} className={basicDisclosureWidthCss}>
        Vegetables are parts of plants that are consumed by humans or other
        animals as food. The original meaning is still commonly used and is
        applied to plants collectively to refer to all edible plant matter,
        including the flowers, fruits, stems, leaves, roots, and seeds.
      </DisclosureContent>
    </div>
  );
};

const basicDisclosureWidthCss = css`
  width: ${themed.spacing.rem.n80};
`;

const demos = [
  {
    title: 'Basic Disclosure',
    demo: <BasicDisclosure />,
    demoNotCenter: true,
  },
];

export const C4a1Disclosure = () => {
  return <DocPage title='Disclosure/Collapse' previews={demos} />;
};

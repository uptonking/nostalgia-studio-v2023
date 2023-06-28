import React from 'react';

import {
  Disclosure,
  DisclosureContent,
  DocPage,
  useDisclosureStore,
} from '@pgd/ui-react';

const BasicDisclosure = () => {
  const store = useDisclosureStore();

  return (
    <>
      <Disclosure store={store} className='button'>
        What are vegetables?
      </Disclosure>
      <DisclosureContent store={store} className='content'>
        <p>
          Vegetables are parts of plants that are consumed by humans or other
          animals as food. The original meaning is still commonly used and is
          applied to plants collectively to refer to all edible plant matter,
          including the flowers, fruits, stems, leaves, roots, and seeds.
        </p>
      </DisclosureContent>
    </>
  );
};

const demos = [
  {
    title: 'Basic Disclosure',
    demo: <BasicDisclosure />,
  },
];

export const C4a1Disclosure = () => {
  return <DocPage title='Disclosure/Collapse' previews={demos} />;
};

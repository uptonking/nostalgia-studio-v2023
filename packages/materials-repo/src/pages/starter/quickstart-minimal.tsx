import * as React from 'react';

type QuickStartPageProps = {
  title?: string;
};

export function QuickStartPage(props: QuickStartPageProps) {
  const { title = 'QuickStart' } = props;
  return (
    <div>
      <h3 className='mb-4'>{title}</h3>
      <p>A quick start page from starter/quickstart-minimal.tsx</p>
    </div>
  );
}

export default QuickStartPage;

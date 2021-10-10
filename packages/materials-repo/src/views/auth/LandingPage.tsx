import * as React from 'react';

import RoutesUrlLists from '../../pages/about/routes-url-lists';

type QuickStartPageProps = {
  title?: string;
};

export function LandingPage(props: QuickStartPageProps) {
  const { title = 'Default Landing page for path empty "" or / or *' } = props;
  return (
    <div>
      <RoutesUrlLists title={title} />
    </div>
  );
}

export default LandingPage;

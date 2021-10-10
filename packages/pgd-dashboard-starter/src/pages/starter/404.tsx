import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { QuickStartPage } from '../starter/quickstart';

export function PageNotFound404(props) {
  const {
    title = 'Page Not Found',
    tips = (
      <div>
        <p>
          You can try to go back to <NavLink to='/'>home page</NavLink>.
        </p>

        <p>
          go to <NavLink to='/dashboard/'>dashboard/</NavLink>.
        </p>
        <p>
          go to <NavLink to='/dashboard/a'>dashboard/a</NavLink>.
        </p>
        <p>
          go to <NavLink to='/dashboard/not404'>dashboard/not404</NavLink>.
        </p>
      </div>
    ),
  } = props;

  return (
    <div>
      <QuickStartPage title={title} tips={tips} />
    </div>
  );
}
export default PageNotFound404;

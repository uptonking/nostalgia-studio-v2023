import * as React from 'react';
import { Route } from 'react-router-dom';

import useAuth from '../context/auth';
import Home from './Home';

// interface PrivateRouteProps extends RouteComponentProps {
//   as: React.ElementType<any>;
// }

export default function PrivateRoute({
  as: Comp,
  ...props
  // }: PrivateRouteProps) {
}) {
  const {
    state: { user },
  } = useAuth();

  // return user ? <Comp {...props} /> : <Home />;
  return user ? (
    <Route element={<Comp />} {...props} />
  ) : (
    <Route element={<Home />} {...props} />
  );
}

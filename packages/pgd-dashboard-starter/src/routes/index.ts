import Fulllayout from '../layouts/FullLayout';
import PageNotFound404 from '../pages/exception/404';

const indexRoutes = [
  { path: '/', name: 'Starter', component: Fulllayout },
  // { path: '*', name: '404', component: PageNotFound404 },
];

export default indexRoutes;

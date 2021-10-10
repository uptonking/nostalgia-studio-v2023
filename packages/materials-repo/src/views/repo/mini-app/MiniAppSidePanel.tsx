import 'tocbot/src/scss/tocbot.scss';

import './mini-app.scss';

import classNames from 'classnames';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Card, CardBody } from 'reactstrap';

import { useGlobalContext } from '../../../store/global-context';
import { setSidePanelType } from '../../../store/settings/actions';

/**
 * 右侧边栏，默认显示toc
 */
export function MiniAppSidePanel() {
  const {
    state: {
      settings,
      // miniApp: { openingPagePath },
    },
    dispatch,
  } = useGlobalContext();

  useEffect(() => {
    // console.log(';;pps4 mini-app-toc, ', settings.activeSidePanelType);
    if (settings.activeSidePanelType === 'overlay') {
      dispatch(setSidePanelType('dock'));
    }
  }, [dispatch, settings.activeSidePanelType]);

  const memoedResultJsx = useMemo(
    () => (
      <aside
        className='mini-app-side-panel customizer show-service-panel shadow-none'
        id='customizer'
      >
        <PerfectScrollbar>
          <Card className='shadow-none'>
            <CardBody>
              <div className='customizer-body' />
            </CardBody>
          </Card>
        </PerfectScrollbar>
      </aside>
    ),
    [],
  );

  return memoedResultJsx;
}

export default MiniAppSidePanel;

import { Alert, Drawer } from 'antd';
import React, { useCallback, useContext, useEffect } from 'react';

import { AppState, NotesAppContext } from '../store';
import { setInterfaceWidth } from '../store/interface/actions';
import { toggleInterfaceItem } from '../store/interface/operations';
import KeyboardGuide from './KeyboardGuide';
import Spotlight from './SpotlightContainer';

// import { useDispatch, useSelector } from 'react-redux';
// import { useAuth0 } from "@auth0/auth0-react";

interface IPageProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 各界面默认的布局，主页和编辑页都使用此布局
 */
export default function Page({ left, children, right }: IPageProps) {
  // const state = useSelector((state: AppState) => state);
  const { appState: state, dispatch } = useContext(NotesAppContext);
  const { isTyping } = state.note;
  const { shortcuts, spotlight, rightSplit } = state.interface;

  const isAuthenticated = false;
  // const { isAuthenticated } = useAuth0();
  // const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '?':
          e.preventDefault();
          if (isTyping) return;

          // return dispatch(toggleInterfaceItem('shortcuts'));
          return toggleInterfaceItem('shortcuts')(dispatch, () => state);
        case 'p': // 'cmd+k'
          e.preventDefault();
          e.stopPropagation();
          if (!e.ctrlKey) return;
          // if (!e.shiftKey || !e.ctrlKey) return;

          // return dispatch(toggleInterfaceItem('spotlight'));
          return toggleInterfaceItem('spotlight')(dispatch, () => state);
        case 'Escape':
          // return dispatch(toggleInterfaceItem('spotlight', false));
          return toggleInterfaceItem('spotlight', false)(dispatch, () => state);
        case 'H':
        case 'h':
          if (!e.shiftKey || !e.ctrlKey) return;
          e.preventDefault();
          e.stopPropagation();
          return dispatch(
            setInterfaceWidth('rightSplit', (rightSplit.width || 25) + 5),
          );
        case 'L':
        case 'l':
          if (!e.shiftKey || !e.ctrlKey) return;
          e.preventDefault();
          e.stopPropagation();

          return dispatch(
            setInterfaceWidth('rightSplit', (rightSplit.width || 25) - 5),
          );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isTyping, rightSplit.width, state]);

  const handleToggleShortcutsDrawer = useCallback(() => {
    toggleInterfaceItem('shortcuts')(dispatch, () => state);
  }, [dispatch, state]);

  return (
    <div>
      {!isAuthenticated && (
        <Alert
          message='You are not yet signed in. Nothing you do here will be saved.'
          showIcon
        />
      )}

      <div
        style={{
          height: isAuthenticated ? '100vh' : 'calc(100vh - 40px)',
          display: 'flex',
          background: '#fafcff',
        }}
      >
        {left && <div style={{ width: '15%' }}>{left}</div>}

        {spotlight.isOpen && <Spotlight />}

        <div
          style={{
            flex: 1,
            background: 'white',
            boxShadow:
              '0 0 30px 0 rgba(0, 0, 0, 0.1), 0 0 0.5px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {children}
        </div>

        {right && <div style={{ width: `${rightSplit.width}%` }}>{right}</div>}

        <Drawer
          title='Keyboard shortcuts'
          visible={shortcuts.isOpen}
          // onClose={() => dispatch(toggleInterfaceItem('shortcuts'))}
          onClose={handleToggleShortcutsDrawer}
          width={400}
        >
          <KeyboardGuide />
        </Drawer>
      </div>
    </div>
  );
}

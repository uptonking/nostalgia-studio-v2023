import React, { ReactNode } from 'react';

import { useStore } from '@nanostores/react';
import { getPagePath } from '@nanostores/router';

import { authStore } from '../../stores/auth';
import { router } from '../../stores/router';
import styles from './Layout.module.css';

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props): JSX.Element => {
  const { id: userId } = useStore(authStore);

  return (
    <div className={styles.layout}>
      <header>
        <h1 className={styles.title}>todos</h1>
      </header>

      <main>{children}</main>

      <footer className={styles.footer}>
        {userId && (
          <>
            <p>
              <a
                href={getPagePath(router, 'logout')}
                className={styles.footerLink}
              >
                Logout
              </a>
            </p>
            <p>Double-click to edit a todo</p>
          </>
        )}
        <p>
          Template by{' '}
          <a className={styles.footerLink} href='https://sindresorhus.com'>
            Sindre Sorhus
          </a>
        </p>
        <p>
          Part of{' '}
          <a className={styles.footerLink} href='https://todomvc.com'>
            TodoMVC
          </a>
        </p>
      </footer>
    </div>
  );
};

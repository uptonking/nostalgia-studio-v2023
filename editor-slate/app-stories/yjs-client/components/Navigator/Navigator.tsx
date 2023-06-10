import React from 'react';

import clsx from 'clsx';
import { Link, type LinkProps } from 'react-router-dom';

import MenuIcon from '../../assets/menu.svg';

function DropdownElement({ children, className, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={clsx(
        'nav-link block px-4 py-2 hover:bg-gray-100 text-black no-underline',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/**
 * document cases switcher
 */
export function Navigator() {
  return (
    <div className='top-4 left-4 fixed'>
      <div className='caseSwitcher flex gap-4 relative navigation-dropdown'>
        {/* <button
          className='hover:bg-gray-100 text-white p-3 rounded'
          type='button'
        >
          <img src={MenuIcon} width={24} height={24} alt='Dropdown Opener' />
        </button> */}
        <DropdownElement to='/simple'>Simple</DropdownElement>
        <DropdownElement to='/remote-cursors-overlay'>
          cursors(overlay)
        </DropdownElement>
        <DropdownElement to='/remote-cursors-decoration'>
          cursors(decorations)
        </DropdownElement>
      </div>
    </div>
  );
}

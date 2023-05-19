import React from 'react';

import styled from 'styled-components';

import { Header } from './Header';
import { MenuComponent } from './Menu/MenuComponent';
import { TodoNotes } from './TodoNote/TodoNotes';

const BottomDecoration = styled.div`
  .line1 {
    position: absolute;
    bottom: 32px;
    right: -25px;
    width: 130px;
    height: 14px;
    background-color: rgba(63, 73, 118, 0.8);
    transform: rotate(-45deg);
  }

  .line2 {
    position: absolute;
    bottom: 9px;
    right: -18px;
    width: 90px;
    height: 14px;
    background-color: rgba(63, 73, 118, 0.8);
    transform: rotate(-45deg);
  }

  .line3 {
    position: absolute;
    bottom: -4px;
    right: -18px;
    width: 50px;
    height: 14px;
    background-color: rgba(63, 73, 118, 0.8);
    transform: rotate(-45deg);
  }
`;
export const MainPage = () => {
  return (
    <>
      <Header />
      <TodoNotes />
      <MenuComponent />
      <BottomDecoration>
        <div className='line1'></div>
        <div className='line2'></div>
        <div className='line3'></div>
      </BottomDecoration>
    </>
  );
};

import * as React from 'react';

export function Square(props: Record<string, any>) {
  return (
    <button className='square' onClick={props.onClick}>
      {props.value}
    </button>
  );
}

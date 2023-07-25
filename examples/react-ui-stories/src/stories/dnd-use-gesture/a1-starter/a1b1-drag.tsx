import React, { useEffect, useRef, useState } from 'react';

import { css } from '@linaria/core';
import { DragGesture } from '@use-gesture/vanilla';

function Draggable() {
  // const ref = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<HTMLDivElement>(null);

  const [color, setColor] = useState('black');
  const toggleColor = () =>
    setColor((c) => (c === 'black' ? '#952e3a' : 'black'));

  const [coords, set] = useState({ x: 0, y: 0 });
  const dragGesture = useRef<DragGesture>();

  useEffect(() => {
    dragGesture.current = new DragGesture(
      dragTarget.current!,
      ({ active, ...state }) => {
        console.log(';; doState ', state.movement, state.offset, state);
        set({ x: state.offset[0], y: state.offset[1] });
      },
    );

    return () => dragGesture.current?.destroy();
  }, []);

  // useEffect(() => {
  //   if (!dragGesture.current) return;
  //   // dragGesture.current.setConfig({ ...rest, pointer: pointerOptions, ...(boundToParent && { bounds: ref }) })
  // }, []);

  return (
    <>
      <div
        ref={dragTarget}
        tabIndex={-1}
        className={dragElemCss}
        style={{ transform: `translate3d(${coords.x}px, ${coords.y}px, 0px)` }}
      >
        <div
          onClick={toggleColor}
          className={dragInfoCss}
          style={{ backgroundColor: color }}
        >
          <span>drag-me</span>
          <span>
            x:{Math.round(coords.x)}, y:{Math.round(coords.y)}
          </span>
        </div>
      </div>
      <div
        // ref={ref}
        className={bgElemCss}
      />
    </>
  );
}

export function A1b1Drag() {
  return (
    <div className={rootCss}>
      <Draggable />
    </div>
  );
}

const rootCss = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const bgElemCss = css`
  height: 200px;
  width: 200px;
  background-color: #133d7e;
`;

const dragElemCss = css`
  position: absolute;
  height: 120px;
  width: 120px;
  background-color: #952e3a;
  cursor: grab;
  touch-action: none;
  user-select: none;
`;

const dragInfoCss = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 80%;
  margin: 10%;
  background-color: #000;
  color: #fff;
  font-size: 1.125rem;
  line-height: 1.5;
`;

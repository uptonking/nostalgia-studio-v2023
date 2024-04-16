import React, { useCallback, useEffect, useRef, useState } from 'react';

import { css } from '@linaria/core';
import { DragGesture } from '@use-gesture/vanilla';

/**
 * ✨ drag div anywhere
 *
 * - ❓ not-yet
 *   - 内层元素的onClick方法在gesture回调函数之后才执行
 */
function Draggable() {
  // const ref = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<HTMLDivElement>(null);
  const dragGesture = useRef<DragGesture>();

  const [color, setColor] = useState('black');
  const toggleColor = useCallback(() => {
    // console.log(';; toggle-color ');
    setColor((c) => (c === 'black' ? '#952e3a' : 'black'));
  }, []);

  const [mvOffset, setMvOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    dragGesture.current = new DragGesture(
      dragTarget.current,
      ({ active, ...state }) => {
        console.log(';; doState ', state.movement, state.offset, state);
        setMvOffset({ x: state.offset[0], y: state.offset[1] });
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
      {/* draggable-elements, with `position: absolute` */}
      <div
        ref={dragTarget}
        tabIndex={-1}
        className={dragElemCss}
        style={{
          transform: `translate3d(${mvOffset.x}px, ${mvOffset.y}px, 0px)`,
        }}
      >
        <div
          onClick={toggleColor}
          className={dragHandleCss}
          style={{ backgroundColor: color }}
        >
          <span>👏🏻 Drag Me</span>
          <span>
            x:{Math.round(mvOffset.x)}, y:{Math.round(mvOffset.y)}
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
  width: 200px;
  height: 200px;
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

const dragHandleCss = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 80%;
  margin: 10%;
  border: 1px solid #fff;
  background-color: #000;
  color: #fff;
  font-size: 1.125rem;
  line-height: 1.5;
`;

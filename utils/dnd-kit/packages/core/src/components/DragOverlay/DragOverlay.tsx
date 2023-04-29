import React, { useContext, useMemo } from 'react';

import { useDndContext } from '../../hooks';
import { useInitialValue } from '../../hooks/utilities';
import { applyModifiers, Modifiers } from '../../modifiers';
import type { ClientRect } from '../../types';
import { ActiveDraggableContext } from '../DndContext';
import type { PositionedOverlayProps } from './components';
import {
  AnimationManager,
  NullifiedContextProvider,
  PositionedOverlay,
} from './components';
import type { DropAnimation } from './hooks';
import { useDropAnimation, useKey } from './hooks';

export interface Props
  extends Pick<
    PositionedOverlayProps,
    'adjustScale' | 'children' | 'className' | 'style' | 'transition'
  > {
  dropAnimation?: DropAnimation | null | undefined;
  /** use to dynamically modify the movement coordinates that are detected by sensors. */
  modifiers?: Modifiers;
  wrapperElement?: keyof JSX.IntrinsicElements;
  /** sets the z-order of the drag overlay.
   * - The default value is 999 for compatibility reasons, but we highly recommend you use a lower value.
   */
  zIndex?: number;
  debug?: boolean | { border?: string };
}

/**
 * `<DragOverlay>` component provides a way to render a draggable overlay that is
 * removed from the normal document flow and is positioned relative to the viewport.
 * - position: 'fixed'
 * - https://docs.dndkit.com/api-documentation/draggable/drag-overlay
 */
export const DragOverlay = React.memo(
  ({
    adjustScale = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = 'div',
    className,
    zIndex = 999,
    debug = false,
  }: Props) => {
    const {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggableNodes,
      droppableContainers,
      dragOverlay,
      over,
      measuringConfiguration,
      scrollableAncestors,
      scrollableAncestorRects,
      windowRect,
    } = useDndContext();
    const transform = useContext(ActiveDraggableContext);
    const key = useKey(active?.id);
    const modifiedTransform = applyModifiers(modifiers, {
      activatorEvent,
      active,
      activeNodeRect,
      containerNodeRect,
      draggingNodeRect: dragOverlay.rect,
      over,
      overlayNodeRect: dragOverlay.rect,
      scrollableAncestors,
      scrollableAncestorRects,
      transform,
      windowRect,
    });
    const initialRect = useInitialValue(activeNodeRect) as ClientRect;
    const dropAnimation = useDropAnimation({
      config: dropAnimationConfig,
      draggableNodes,
      droppableContainers,
      measuringConfiguration,
    });
    // We need to wait for the active node to be measured before connecting the drag overlay ref
    // otherwise collisions can be computed against a mispositioned drag overlay
    const ref = initialRect ? dragOverlay.setRef : undefined;

    const styles = useMemo(() => {
      return {
        zIndex,
        ...style,
      };
    }, [style, zIndex]);

    return (
      <NullifiedContextProvider>
        <AnimationManager animation={dropAnimation}>
          {active && key ? (
            <PositionedOverlay
              key={key}
              id={active.id}
              ref={ref}
              as={wrapperElement}
              activatorEvent={activatorEvent}
              adjustScale={adjustScale}
              className={className}
              transition={transition}
              rect={initialRect}
              style={styles}
              transform={modifiedTransform}
              debug={debug}
            >
              {children}
            </PositionedOverlay>
          ) : null}
        </AnimationManager>
      </NullifiedContextProvider>
    );
  },
);

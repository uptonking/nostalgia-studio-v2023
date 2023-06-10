import {
  closestCorners,
  type DroppableContainer,
  getClientRect,
  getFirstCollision,
  KeyboardCode,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';

import { type SensorConfig } from './types';
import { getDepthCandidate } from './utils';

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontalKeys: string[] = [KeyboardCode.Left, KeyboardCode.Right];

export const sortableTreeKeyboardCoordinates =
  (
    context: SensorConfig,
    showIndicator: boolean,
    indentationWidth: number,
  ): KeyboardCoordinateGetter =>
  (
    event,
    {
      currentCoordinates,
      context: {
        active,
        over,
        collisionRect,
        droppableRects,
        droppableContainers,
      },
    },
  ) => {
    if (directions.includes(event.code)) {
      if (!active || !collisionRect) {
        return undefined;
      }
      event.preventDefault();

      const {
        current: { items, offset },
      } = context;

      // /for key arrowLeft/Right, simply modify x
      if (horizontalKeys.includes(event.code) && over?.id) {
        const { depth, maxDepth, minDepth } = getDepthCandidate(
          items,
          active.id,
          over.id,
          offset,
          indentationWidth,
        );
        console.log(';; arrowLR ', offset, depth, maxDepth, minDepth);

        switch (event.code) {
          case KeyboardCode.Left:
            if (depth > minDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x - indentationWidth,
              };
            }
            break;
          case KeyboardCode.Right:
            if (depth < maxDepth) {
              return {
                ...currentCoordinates,
                x: currentCoordinates.x + indentationWidth,
              };
            }
            break;
        }

        return undefined;
      }

      const mayDrop: DroppableContainer[] = [];

      // /for key arrowUp/Down
      droppableContainers.forEach((container) => {
        if (container?.disabled || container.id === over?.id) {
          return;
        }

        const containerRect = droppableRects.get(container.id);
        if (!containerRect) {
          return;
        }

        switch (event.code) {
          case KeyboardCode.Down: // when key down, find items above limit
            if (containerRect.top > collisionRect.top) {
              mayDrop.push(container);
            }
            break;
          case KeyboardCode.Up:
            if (containerRect.top < collisionRect.top) {
              mayDrop.push(container);
            }
            break;
        }
      });

      const collisions = closestCorners({
        active,
        collisionRect,
        pointerCoordinates: null,
        droppableRects,
        droppableContainers: mayDrop,
      });
      let closestId = getFirstCollision(collisions, 'id');
      if (closestId === over?.id && collisions.length > 1) {
        closestId = collisions[1].id;
      }

      if (closestId && over?.id) {
        const activeRect = droppableRects.get(active.id);
        const newRect = droppableRects.get(closestId);
        const newDroppable = droppableContainers.get(closestId);

        if (activeRect && newRect && newDroppable) {
          const newIndex = items.findIndex(({ id }) => id === closestId);
          const newItem = items[newIndex];
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const activeItem = items[activeIndex];

          if (newItem && activeItem) {
            const { depth } = getDepthCandidate(
              items,
              active.id,
              closestId,
              (newItem.depth - activeItem.depth) * indentationWidth,
              indentationWidth,
            );
            const isBelow = newIndex > activeIndex;
            const modifier = isBelow ? 1 : -1;
            const offset = showIndicator
              ? (collisionRect.height - activeRect.height) / 2
              : 0;

            const newCoordinates = {
              x: newRect.left + depth * indentationWidth,
              y: newRect.top + modifier * offset,
            };

            return newCoordinates;
          }
        }
      }
    }

    return undefined;
  };

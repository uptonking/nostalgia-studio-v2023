import React, { forwardRef, useMemo } from 'react';

import { type Transform } from '@dnd-kit/utilities';
import { CSS, isKeyboardEvent } from '@dnd-kit/utilities';

import { type ClientRect, type UniqueIdentifier } from '../../../../types';
import { getRelativeTransformOrigin } from '../../../../utilities';

type TransitionGetter = (
  activatorEvent: Event | null,
) => React.CSSProperties['transition'] | undefined;

export interface Props {
  as: keyof JSX.IntrinsicElements;
  activatorEvent: Event | null;
  adjustScale?: boolean;
  children?: React.ReactNode;
  className?: string;
  id: UniqueIdentifier;
  rect: ClientRect | null;
  style?: React.CSSProperties;
  transition?: string | TransitionGetter;
  transform: Transform;
  debug?: boolean | { border?: string };
}

const baseStyles: React.CSSProperties = {
  position: 'fixed',
  touchAction: 'none',
};

const defaultTransition: TransitionGetter = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);

  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

/**
 * default style `position: 'fixed'`
 */
export const PositionedOverlay = forwardRef<HTMLElement, Props>(
  (
    {
      as,
      activatorEvent,
      adjustScale,
      children,
      className,
      rect,
      style,
      transform,
      transition = defaultTransition,
      debug,
    },
    ref,
  ) => {
    // if (!rect) {
    //   return null;
    // }

    const scaleAdjustedTransform = useMemo(() => {
      return adjustScale
        ? transform
        : {
            ...transform,
            scaleX: 1,
            scaleY: 1,
          };
    }, [adjustScale, transform]);

    const styles: React.CSSProperties | undefined = useMemo(() => {
      const styl = rect
        ? {
            ...baseStyles,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            transform: CSS.Transform.toString(scaleAdjustedTransform),
            transformOrigin:
              adjustScale && activatorEvent
                ? getRelativeTransformOrigin(
                    activatorEvent as MouseEvent | KeyboardEvent | TouchEvent,
                    rect,
                  )
                : undefined,
            transition:
              typeof transition === 'function'
                ? transition(activatorEvent)
                : transition,
            ...style,
          }
        : undefined;

      if (styl && debug) {
        style.border = '1px solid red';
      }

      return styl;
    }, [
      activatorEvent,
      adjustScale,
      debug,
      rect,
      scaleAdjustedTransform,
      style,
      transition,
    ]);

    return rect
      ? React.createElement(
          as,
          {
            className,
            style: styles,
            ref,
          },
          children,
        )
      : null;
  },
);

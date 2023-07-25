import {
  dragAction,
  hoverAction,
  moveAction,
  pinchAction,
  scrollAction,
  wheelAction,
} from '@use-gesture/core/actions';
import {
  type AnyHandlerEventTypes,
  type EventTypes,
  type GestureHandlers,
  type UserGestureConfig,
} from '@use-gesture/core/types';

import { createGesture } from './createGesture';
import { type Recognizer } from './Recognizer';

interface GestureConstructor {
  new <HandlerTypes extends AnyHandlerEventTypes = EventTypes>(
    target: EventTarget,
    handlers: GestureHandlers<HandlerTypes>,
    config?: UserGestureConfig,
  ): Gesture;
}

export interface Gesture extends Recognizer {}

export const Gesture: GestureConstructor = function <
  HandlerTypes extends AnyHandlerEventTypes = EventTypes,
>(
  target: EventTarget,
  handlers: GestureHandlers<HandlerTypes>,
  config?: UserGestureConfig,
) {
  const gestureFunction = createGesture([
    dragAction,
    pinchAction,
    scrollAction,
    wheelAction,
    moveAction,
    hoverAction,
  ]);

  return gestureFunction(target, handlers, config || ({} as UserGestureConfig));
} as any;

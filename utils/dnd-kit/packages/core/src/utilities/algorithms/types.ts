import {
  type Active,
  type Data,
  type DroppableContainer,
  type RectMap,
} from '../../store';
import {
  type ClientRect,
  type Coordinates,
  type UniqueIdentifier,
} from '../../types';

/** id + data, candidate node data for drop */
export interface Collision {
  id: UniqueIdentifier;
  data?: Data;
}

export interface CollisionDescriptor extends Collision {
  data: {
    droppableContainer: DroppableContainer;
    value: number;
    [key: string]: any;
  };
}

export type CollisionDetection = (args: {
  active: Active;
  collisionRect: ClientRect;
  droppableRects: RectMap;
  droppableContainers: DroppableContainer[];
  pointerCoordinates: Coordinates | null;
}) => Collision[];

import { type MutableRefObject } from 'react';

import { type DeepRequired } from '@dnd-kit/utilities';

import { type MeasuringConfiguration } from '../components';
import { type SyntheticListeners } from '../hooks/utilities';
import {
  type ClientRect,
  type Coordinates,
  type UniqueIdentifier,
} from '../types';
import { type Collision } from '../utilities/algorithms';
import { type Actions } from './actions';
import { type DroppableContainersMap } from './constructors';

type AnyData = Record<string, any>;

export type Data<T = AnyData> = T & AnyData;

export type DataRef<T = AnyData> = MutableRefObject<Data<T> | undefined>;

/** active dragging node data */
export interface Active {
  id: UniqueIdentifier;
  data: DataRef;
  rect: MutableRefObject<{
    initial: ClientRect | null;
    translated: ClientRect | null;
  }>;
}

/** over node data */
export interface Over {
  id: UniqueIdentifier;
  data: DataRef;
  rect: ClientRect;
  disabled: boolean;
}

/** data + domNode + activatorNode */
export type DraggableNode = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  activatorNode: MutableRefObject<HTMLElement | null>;
  data: DataRef;
};

export type DraggableNodes = Map<UniqueIdentifier, DraggableNode | undefined>;

/** DraggableNode + collection */
export interface DraggableElement {
  node: DraggableNode;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

/** data + domNode + rect */
export interface DroppableContainer {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<ClientRect | null>;
}

/** es Map, { id: DroppableContainer } */
export type DroppableContainers = DroppableContainersMap;

export type RectMap = Map<UniqueIdentifier, ClientRect>;

/** dnd-kit global state */
export interface State {
  droppable: {
    containers: DroppableContainers;
  };
  draggable: {
    active: UniqueIdentifier | null;
    initialCoordinates: Coordinates;
    nodes: DraggableNodes;
    translate: Coordinates;
  };
}

export interface PublicContextDescriptor {
  activatorEvent: Event | null;
  active: Active | null;
  activeNode: HTMLElement | null;
  activeNodeRect: ClientRect | null;
  collisions: Collision[] | null;
  containerNodeRect: ClientRect | null;
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  droppableRects: RectMap;
  over: Over | null;
  dragOverlay: {
    nodeRef: MutableRefObject<HTMLElement | null>;
    rect: ClientRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
  measuringScheduled: boolean;
  windowRect: ClientRect | null;
}

export interface InternalContextDescriptor {
  activatorEvent: Event | null;
  activators: SyntheticListeners;
  active: Active | null;
  activeNodeRect: ClientRect | null;
  ariaDescribedById: {
    draggable: string;
  };
  dispatch: React.Dispatch<Actions>;
  draggableNodes: DraggableNodes;
  over: Over | null;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
}

import { createContext, useContext } from 'react';

import type { Element } from 'slate';

type DndStateValue = {
  activeId: string | null;
  activeElement: Element | null;
  dragDepth: number;
  dragOverlayHeight: number | null;
};

const DndStateContext = createContext<DndStateValue>({} as DndStateValue);

export const useDndState = () => {
  return useContext(DndStateContext);
};

export const DndStateProvider = DndStateContext.Provider;

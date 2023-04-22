import { createContext, useContext } from 'react';

import type { Element } from 'slate';

type DndContextValueType = {
  activeId: string | null;
  activeElement: Element | null;
  dragDepth: number;
  dragOverlayHeight: number | null;
};

const DndStateContext = createContext<DndContextValueType>(
  {} as DndContextValueType,
);

export const useDndContext = () => {
  const context = useContext(DndStateContext);
  if (context === undefined) {
    throw new Error('useDndContext must be used in a DndContextProvider');
  }
  return context;
};

export const DndContextProvider = DndStateContext.Provider;

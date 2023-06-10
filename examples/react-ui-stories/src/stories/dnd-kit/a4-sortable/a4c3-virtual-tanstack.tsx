import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { css } from '@linaria/core';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Item, Wrapper } from '../components';
import { createRange } from '../utils';
import { SortableItem, type SortableProps } from './sortable';

const props = {
  strategy: verticalListSortingStrategy,
};

export const A4c3VirtualTanstack = () => <Sortable {...props} />;

export const VirtualList = ({
  width,
  height,
  itemCount,
  itemSize,
  renderItem,
}) => {
  const scrollElemRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => scrollElemRef.current,
    count: itemCount,
    estimateSize: () => itemSize,
    overscan: 1,
  });

  return (
    <div
      // className={listCss}
      ref={scrollElemRef}
      style={{
        height: height + 'px',
        width: width + 'px',
        // width: `100%`, // `auto` not work
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
        }}
      >
        {/* Only the visible items in the virtualizer, manually positioned to be in view */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          return renderItem({
            index: virtualRow.index,
            style: {
              position: 'absolute',
              left: 0,
              top: virtualRow.start + 'px',
              // top: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              // transform: `translateY(${virtualRow.start}px)`,
            },
          });
        })}
      </div>
    </div>
  );
};

function Sortable({
  adjustScale = false,
  strategy = verticalListSortingStrategy,
  itemCount = 100,
  handle = false,
  getItemStyles = () => ({}),
  modifiers,
}: SortableProps) {
  const [items, setItems] = useState(() =>
    createRange<UniqueIdentifier>(itemCount, (index) => `${index + 1}`),
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: 'Cypress' in window ? 'auto' : undefined,
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        setActiveId(active.id);
      }}
      onDragEnd={({ over }) => {
        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => arrayMove(items, activeIndex, overIndex));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      modifiers={modifiers}
    >
      <Wrapper center>
        <SortableContext items={items} strategy={strategy}>
          <VirtualList
            width={500}
            height={600}
            // className={virtualListCss}
            itemCount={items.length}
            itemSize={64}
            renderItem={({ index, style }) => {
              const id = items[index];

              return (
                <SortableItem
                  key={id}
                  id={id}
                  index={index}
                  handle={handle}
                  wrapperStyle={() => ({
                    ...style,
                    padding: 5,
                  })}
                  style={getItemStyles}
                  useDragOverlay
                />
              );
            }}
          />
        </SortableContext>
      </Wrapper>
      {createPortal(
        <DragOverlay adjustScale={adjustScale}>
          {activeId ? (
            <Item
              value={items[activeIndex]}
              handle={handle}
              style={getItemStyles({
                id: activeId,
                index: activeIndex,
                isDragging: true,
                isSorting: true,
                overIndex: -1,
                isDragOverlay: true,
              })}
              wrapperStyle={{
                padding: 5,
              }}
              dragOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

const virtualListCss = css`
  > div {
    overflow: hidden;
  }
`;

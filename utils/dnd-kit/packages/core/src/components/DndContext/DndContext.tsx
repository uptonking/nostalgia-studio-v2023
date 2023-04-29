import React, {
  createContext,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import type { Transform } from '@dnd-kit/utilities';
import {
  add,
  getEventCoordinates,
  getWindow,
  useIsomorphicLayoutEffect,
  useLatestValue,
  useUniqueId,
} from '@dnd-kit/utilities';

import type {
  AutoScrollOptions,
  SyntheticListener,
} from '../../hooks/utilities';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useDragOverlayMeasuring,
  useDroppableMeasuring,
  useInitialRect,
  useRect,
  useRectDelta,
  useRects,
  useScrollableAncestors,
  useScrollOffsets,
  useScrollOffsetsDelta,
  useSensorSetup,
  useWindowRect,
} from '../../hooks/utilities';
import { applyModifiers, Modifiers } from '../../modifiers';
import type {
  Sensor,
  SensorActivatorFunction,
  SensorContext,
  SensorDescriptor,
  SensorInstance,
} from '../../sensors';
import {
  Action,
  getInitialState,
  InternalContext,
  InternalContextDescriptor,
  PublicContext,
  PublicContextDescriptor,
  reducer,
} from '../../store';
import type { Active, Over } from '../../store/types';
import type {
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '../../types';
import {
  adjustScale,
  CollisionDetection,
  defaultCoordinates,
  getAdjustedRect,
  getFirstCollision,
  rectIntersection,
} from '../../utilities';
import {
  Accessibility,
  Announcements,
  RestoreFocus,
  ScreenReaderInstructions,
} from '../Accessibility';
import {
  DndMonitorContext,
  useDndMonitorProvider as useDndMonitorEmit,
} from '../DndMonitor';
import { defaultData, defaultSensors } from './defaults';
import {
  useLayoutShiftScrollCompensation,
  useMeasuringConfiguration,
} from './hooks';
import type { MeasuringConfiguration } from './types';

export interface Props {
  id?: string;
  accessibility?: {
    announcements?: Announcements;
    container?: Element;
    restoreFocus?: boolean;
    screenReaderInstructions?: ScreenReaderInstructions;
  };
  /** Use this to temporarily or permanently disable auto-scrolling for all sensors within this DndContext. */
  autoScroll?: boolean | AutoScrollOptions;
  cancelDrop?: CancelDrop;
  children?: React.ReactNode;
  /** customize the collision detection algorithm used to detect collisions between draggable nodes and droppable areas
   * - default collision detection algorithm is the rectangle intersection algorithm
   */
  collisionDetection?: CollisionDetection;
  /** configure when and how often DndContext should measure its droppable elements  */
  measuring?: MeasuringConfiguration;
  /** use to dynamically modify the movement coordinates that are detected by sensors.  */
  modifiers?: Modifiers;
  /** use to detect different input methods in order to initiate drag operations, respond to movement and end or cancel the operation.
   * - The default sensors used by DndContext are the Pointer and Keyboard sensors.
   */
  sensors?: SensorDescriptor<any>[];
  /** Fires when a drag event that meets the activation constraints for that sensor happens,
   * along with the unique identifier of the draggable element that was picked up. */
  onDragStart?(event: DragStartEvent): void;
  /** Fires anytime as the draggable item is moved. */
  onDragMove?(event: DragMoveEvent): void;
  /** Fires when a draggable item is moved over a droppable container,
   * along with the unique identifier of that droppable container. */
  onDragOver?(event: DragOverEvent): void;
  /** Fires after a draggable item is dropped.
   * - onDragEnd event does not move draggable items into droppable containers.
   */
  onDragEnd?(event: DragEndEvent): void;
  /** Fires if a drag operation is cancelled, for example, if the user presses `Escape` while dragging a draggable item. */
  onDragCancel?(event: DragCancelEvent): void;
}

export interface CancelDropArguments extends DragEndEvent {}

export type CancelDrop = (
  args: CancelDropArguments,
) => boolean | Promise<boolean>;

interface DndEvent extends Event {
  dndKit?: {
    capturedBy: Sensor<any>;
  };
}

export const ActiveDraggableContext = createContext<Transform>({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1,
});

enum Status {
  Uninitialized,
  Initializing,
  Initialized,
}

export const DndContext = memo(function DndContextInner({
  id,
  accessibility,
  autoScroll = true,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  measuring,
  modifiers,
  ...props
}: Props) {
  const latestProps = useLatestValue(props, Object.values(props));

  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const {
    draggable: { active: activeId, nodes: draggableNodes, translate },
    droppable: { containers: droppableContainers },
  } = state;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorEmit();
  const [status, setStatus] = useState<Status>(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const activeRects = useRef<Active['rect']['current']>({
    initial: null,
    translated: null,
  });

  const activeNodeOrNull = activeId ? draggableNodes.get(activeId) : null;
  /** active dragging node data */
  const active = useMemo<Active | null>(
    () =>
      activeId != null
        ? {
            id: activeId,
            // It's possible for the active node to unmount while dragging
            data: activeNodeOrNull?.data ?? defaultData,
            rect: activeRects,
          }
        : null,
    [activeId, activeNodeOrNull],
  );
  const activeRef = useRef<UniqueIdentifier | null>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const [activatorEvent, setActivatorEvent] = useState<Event | null>(null);
  const draggableDescribedById = useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = useMemo(
    () => droppableContainers.getEnabled(),
    [droppableContainers],
  );

  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const { droppableRects, measureDroppableContainers, measuringScheduled } =
    useDroppableMeasuring(enabledDroppableContainers, {
      dragging: isInitialized,
      dependencies: [translate.x, translate.y],
      config: measuringConfiguration.droppable,
    });
  const activeNodeDom = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = useMemo(
    () => (activatorEvent ? getEventCoordinates(activatorEvent) : null),
    [activatorEvent],
  );
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(
    activeNodeDom,
    measuringConfiguration.draggable.measure,
  );

  useLayoutShiftScrollCompensation({
    activeNode: activeId ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure,
  });

  const activeNodeRect = useRect(
    activeNodeDom,
    measuringConfiguration.draggable.measure,
    initialActiveNodeRect,
  );
  const containerNodeRect = useRect(
    activeNodeDom ? activeNodeDom.parentElement : null,
  );

  /** sensorObj Ref */
  const sensorContext = useRef<SensorContext>({
    activatorEvent: null,
    active: null,
    activeNode: activeNodeDom,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
  });
  const overNodeDom = droppableContainers.getNodeFor(
    sensorContext.current.over?.id,
  );
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure,
  });
  // Use the rect of the drag overlay if it is mounted
  const draggingNodeDom = dragOverlay.nodeRef.current ?? activeNodeDom;
  const draggingNodeRect = isInitialized
    ? dragOverlay.rect ?? activeNodeRect
    : null;
  const isUsingDragOverlay = Boolean(
    dragOverlay.nodeRef.current && dragOverlay.rect,
  );
  // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay
  const nodeRectDelta = useRectDelta(
    isUsingDragOverlay ? null : activeNodeRect,
  );

  // Get the window rect of the dragging node
  const windowRect = useWindowRect(
    draggingNodeDom ? getWindow(draggingNodeDom) : null,
  );

  /** Get scrollable ancestors of the dragging node
   * - `overNodeDom ?? activeNodeDom`
   */
  const scrollableAncestors = useScrollableAncestors(
    isInitialized ? overNodeDom ?? activeNodeDom : null,
  );
  const scrollableAncestorRects = useRects(scrollableAncestors);

  // Apply modifiers to state.translate.x/y
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1,
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect,
  });

  const pointerCoordinates = activationCoordinates
    ? add(activationCoordinates, translate)
    : null;

  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  // Represents the scroll delta since dragging was initiated
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  // Represents the scroll delta since the last time the active node rect was measured
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [
    activeNodeRect,
  ]);
  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);

  /** draggingNodeRect modified */
  const collisionRect = draggingNodeRect
    ? getAdjustedRect(draggingNodeRect, modifiedTranslate)
    : null;

  const collisions =
    active && collisionRect
      ? collisionDetection({
          active,
          collisionRect,
          droppableRects,
          droppableContainers: enabledDroppableContainers,
          pointerCoordinates,
        })
      : null;
  const overId = getFirstCollision(collisions, 'id');
  const [over, setOver] = useState<Over | null>(null);

  // When there is no drag overlay used, we need to account for window scroll delta
  const appliedTranslate = isUsingDragOverlay
    ? modifiedTranslate
    : add(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(
    appliedTranslate,
    over?.rect ?? null,
    activeNodeRect,
  );

  /** init sensor, setOver data */
  const instantiateSensor = useCallback(
    (
      event: React.SyntheticEvent,
      { sensor: Sensor, options }: SensorDescriptor<any>,
    ) => {
      if (activeRef.current == null) {
        return;
      }

      const activeNode = draggableNodes.get(activeRef.current);

      if (!activeNode) {
        return;
      }

      const activatorEvent = event.nativeEvent;

      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode,
        event: activatorEvent,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onStart(initialCoordinates) {
          const id = activeRef.current;

          if (id == null) {
            return;
          }

          const draggableNode = draggableNodes.get(id);

          if (!draggableNode) {
            return;
          }

          const { onDragStart } = latestProps.current;
          const event: DragStartEvent = {
            active: { id, data: draggableNode.data, rect: activeRects },
          };

          unstable_batchedUpdates(() => {
            onDragStart?.(event);
            setStatus(Status.Initializing);
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id,
            });
            dispatchMonitorEvent({ type: 'onDragStart', event });
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates,
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel),
      });

      unstable_batchedUpdates(() => {
        setActiveSensor(sensorInstance);
        setActivatorEvent(event.nativeEvent);
      });

      function createHandler(type: Action.DragEnd | Action.DragCancel) {
        return async function handler() {
          const { active, collisions, over, scrollAdjustedTranslate } =
            sensorContext.current;
          let event: DragEndEvent | null = null;

          if (active && scrollAdjustedTranslate) {
            const { cancelDrop } = latestProps.current;

            event = {
              activatorEvent,
              active: active,
              collisions,
              delta: scrollAdjustedTranslate,
              over,
            };

            if (type === Action.DragEnd && typeof cancelDrop === 'function') {
              const shouldCancel = await Promise.resolve(cancelDrop(event));

              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }

          activeRef.current = null;

          unstable_batchedUpdates(() => {
            dispatch({ type });
            setStatus(Status.Uninitialized);
            setOver(null);
            setActiveSensor(null);
            setActivatorEvent(null);

            const eventName =
              type === Action.DragEnd ? 'onDragEnd' : 'onDragCancel';

            if (event) {
              const handler = latestProps.current[eventName];

              handler?.(event);
              dispatchMonitorEvent({ type: eventName, event });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes],
  );

  const bindActivatorToSensorInstantiator = useCallback(
    (
      handler: SensorActivatorFunction<any>,
      sensor: SensorDescriptor<any>,
    ): SyntheticListener['handler'] => {
      return (event, active) => {
        const nativeEvent = event.nativeEvent as DndEvent;
        const activeDraggableNode = draggableNodes.get(active);

        if (
          // Another sensor is already instantiating
          activeRef.current !== null ||
          // No active draggable
          !activeDraggableNode ||
          // Event has already been captured
          nativeEvent.dndKit ||
          nativeEvent.defaultPrevented
        ) {
          return;
        }

        const activationContext = {
          active: activeDraggableNode,
        };
        const shouldActivate = handler(
          event,
          sensor.options,
          activationContext,
        );

        if (shouldActivate === true) {
          nativeEvent.dndKit = {
            capturedBy: sensor.sensor,
          };
          activeRef.current = active;
          instantiateSensor(event, sensor);
        }
      };
    },
    [draggableNodes, instantiateSensor],
  );

  const activators = useCombineActivators(
    sensors,
    bindActivatorToSensorInstantiator,
  );
  useSensorSetup(sensors);

  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);

  useEffect(
    // /onDragMove
    () => {
      const { onDragMove } = latestProps.current;
      const { active, activatorEvent, collisions, over } =
        sensorContext.current;

      if (!active || !activatorEvent) {
        return;
      }

      const event: DragMoveEvent = {
        active,
        activatorEvent,
        collisions,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      unstable_batchedUpdates(() => {
        onDragMove?.(event);
        dispatchMonitorEvent({ type: 'onDragMove', event });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y],
  );

  useEffect(
    // /onDragOver
    () => {
      const {
        active,
        activatorEvent,
        collisions,
        droppableContainers,
        scrollAdjustedTranslate,
      } = sensorContext.current;

      if (
        !active ||
        activeRef.current == null ||
        !activatorEvent ||
        !scrollAdjustedTranslate
      ) {
        return;
      }

      const { onDragOver } = latestProps.current;
      const overContainer = droppableContainers.get(overId);
      const over =
        overContainer && overContainer.rect.current
          ? {
              id: overContainer.id,
              rect: overContainer.rect.current,
              data: overContainer.data,
              disabled: overContainer.disabled,
            }
          : null;
      const event: DragOverEvent = {
        active,
        activatorEvent,
        collisions,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      unstable_batchedUpdates(() => {
        setOver(over);
        onDragOver?.(event);
        dispatchMonitorEvent({ type: 'onDragOver', event });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId],
  );

  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode: activeNodeDom,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode: draggingNodeDom,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate,
    };

    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect,
    };
  }, [
    active,
    activeNodeDom,
    collisions,
    collisionRect,
    draggableNodes,
    draggingNodeDom,
    draggingNodeRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    scrollAdjustedTranslate,
  ]);

  useAutoScroller({
    ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
  });

  const publicContext = useMemo(() => {
    const context: PublicContextDescriptor = {
      active,
      activeNode: activeNodeDom,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect,
    };

    return context;
  }, [
    active,
    activeNodeDom,
    activeNodeRect,
    activatorEvent,
    collisions,
    containerNodeRect,
    dragOverlay,
    draggableNodes,
    droppableContainers,
    droppableRects,
    over,
    measureDroppableContainers,
    scrollableAncestors,
    scrollableAncestorRects,
    measuringConfiguration,
    measuringScheduled,
    windowRect,
  ]);

  const internalContext = useMemo(() => {
    const context: InternalContextDescriptor = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers,
    };

    return context;
  }, [
    activatorEvent,
    activators,
    active,
    activeNodeRect,
    dispatch,
    draggableDescribedById,
    draggableNodes,
    over,
    measureDroppableContainers,
  ]);

  return (
    <DndMonitorContext.Provider value={registerMonitorListener}>
      <InternalContext.Provider value={internalContext}>
        <PublicContext.Provider value={publicContext}>
          <ActiveDraggableContext.Provider value={transform}>
            {children}
          </ActiveDraggableContext.Provider>
        </PublicContext.Provider>
        <RestoreFocus disabled={accessibility?.restoreFocus === false} />
      </InternalContext.Provider>
      <Accessibility
        {...accessibility}
        hiddenTextDescribedById={draggableDescribedById}
      />
    </DndMonitorContext.Provider>
  );

  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoScroll =
      activeSensor?.autoScrollEnabled === false;
    const autoScrollGloballyDisabled =
      typeof autoScroll === 'object'
        ? autoScroll.enabled === false
        : autoScroll === false;
    const enabled =
      isInitialized &&
      !activeSensorDisablesAutoScroll &&
      !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return {
        ...autoScroll,
        enabled,
      };
    }

    return { enabled };
  }
});

import type { Point } from '@/lib/types/point';
import { orientation } from '@/lib/utils/segment';
import { type RefObject, useCallback, useEffect, useEffectEvent, useMemo, useReducer } from 'react';

const MOUSE_ID = -1;

export type Segment = readonly [Point, Point];

export interface SegmentPointerProps {
  readonly cellSize: number;
  readonly rowCount: number;
  readonly columnCount: number;
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly onSegmentCompleted: (segment: Segment) => void;
}

export interface SegmentPointerState {
  readonly isPointing: boolean;
  readonly ongoingSegments: readonly Segment[];
}

export default function useSegmentPointer(props: SegmentPointerProps): SegmentPointerState {
  const { containerRef, onSegmentCompleted } = props;

  const [state, dispatch] = useSegmentsState(props);

  const handleMouseDown = useEffectEvent((event: MouseEvent) => {
    console.log('mouse!');
    dispatch({
      type: 'start',
      id: MOUSE_ID,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  });

  const handleTouchStart = useEffectEvent((event: TouchEvent) => {
    console.log('touch!');
    for (const touch of event.changedTouches) {
      dispatch({
        type: 'start',
        id: touch.identifier,
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    }
  });

  const handleMouseMove = useEffectEvent((event: MouseEvent) => {
    dispatch({
      type: 'move',
      id: MOUSE_ID,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  });

  const handleTouchMove = useEffectEvent((event: TouchEvent) => {
    for (const touch of event.changedTouches) {
      dispatch({
        type: 'move',
        id: touch.identifier,
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    }
  });

  const handleMouseUp = useEffectEvent(() => {
    if (state[MOUSE_ID]) {
      onSegmentCompleted(state[MOUSE_ID]);
    }

    dispatch({ type: 'end', id: MOUSE_ID });
  });

  const handleTouchEnd = useEffectEvent((event: TouchEvent) => {
    for (const touch of event.changedTouches) {
      if (state[touch.identifier]) {
        onSegmentCompleted(state[touch.identifier]);
      }

      dispatch({ type: 'end', id: touch.identifier });
    }
  });

  const handleTouchCancel = useEffectEvent((event: TouchEvent) => {
    for (const touch of event.changedTouches) {
      dispatch({ type: 'end', id: touch.identifier });
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
    };
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, []);

  const ongoingSegments = useMemo(() => Object.values(state), [state]);

  return {
    isPointing: ongoingSegments.length > 0,
    ongoingSegments,
  };
}

// Internal state
type SegmentsState = Record<number, Segment>;

interface StartSegmentAction {
  readonly type: 'start';
  readonly id: number;
  readonly clientX: number;
  readonly clientY: number;
}

interface MoveSegmentAction {
  readonly type: 'move';
  readonly id: number;
  readonly clientX: number;
  readonly clientY: number;
}

interface EndSegmentAction {
  readonly type: 'end';
  readonly id: number;
}

type SegmentsAction = StartSegmentAction | MoveSegmentAction | EndSegmentAction;

function useSegmentsState(props: SegmentPointerProps) {
  const { containerRef, cellSize, columnCount: cols, rowCount: rows } = props;

  const reducer = useCallback(
    (state: SegmentsState, action: SegmentsAction): SegmentsState => {
      if (!containerRef.current) {
        return state;
      }

      switch (action.type) {
        case 'start': {
          const bbox = containerRef.current.getBoundingClientRect();
          const point = {
            x: Math.min(Math.max(Math.floor((action.clientX - bbox.left) / cellSize), 0), cols - 1),
            y: Math.min(Math.max(Math.floor((action.clientY - bbox.top) / cellSize), 0), rows - 1),
          };

          return {
            ...state,
            [action.id]: [point, point],
          };
        }
        case 'move': {
          if (!state[action.id]) {
            return state;
          }

          const [start] = state[action.id];

          // Compute "hovered" point
          const bbox = containerRef.current.getBoundingClientRect();

          let point = {
            x: Math.floor((action.clientX - bbox.left) / cellSize),
            y: Math.floor((action.clientY - bbox.top) / cellSize),
          };

          let dx = point.x - start.x;
          let dy = point.y - start.y;

          // Limit angle
          const a = Math.round(orientation(start, point) / (Math.PI / 4)) * (Math.PI / 4);

          if (Math.abs(a) === Math.PI / 2) {
            point = {
              x: start.x,
              y: Math.min(Math.max(point.y, 0), rows - 1),
            };
          } else if (Math.abs(a) === Math.PI || a === 0) {
            point = {
              x: Math.min(Math.max(point.x, 0), cols - 1),
              y: start.y,
            };
          } else if (Math.abs(dx) < Math.abs(dy)) {
            point = {
              x: point.x,
              y: start.y + Math.round(dx * Math.tan(a)),
            };
          } else {
            point = {
              x: start.x + Math.round(dy / Math.tan(a)),
              y: point.y,
            };
          }

          // Limit length
          dx = point.x - start.x;
          dy = point.y - start.y;

          if (point.x > cols - 1) {
            point.x = cols - 1;
            point.y = start.y + Math.sign(dy) * (cols - 1 - start.x);
          } else if (point.x < 0) {
            point.x = 0;
            point.y = start.y + Math.sign(dy) * start.x;
          }

          if (point.y > rows - 1) {
            point.x = start.x + Math.sign(dx) * (rows - 1 - start.y);
            point.y = rows - 1;
          } else if (point.y < 0) {
            point.x = start.x + Math.sign(dx) * start.y;
            point.y = 0;
          }

          return { ...state, [action.id]: [start, point] };
        }
        case 'end': {
          if (!state[action.id]) {
            return state;
          }

          const { [action.id]: _, ...rest } = state;
          return rest;
        }
      }
    },
    [cellSize, cols, containerRef, rows],
  );

  return useReducer(reducer, {});
}

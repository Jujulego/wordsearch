import type { Point } from '@/lib/types/point';
import { orientation } from '@/lib/utils/segment';
import { type RefObject, useCallback, useEffect, useState } from 'react';

export interface SegmentPointerProps {
  readonly cellSize: number;
  readonly rowCount: number;
  readonly columnCount: number;
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly onSegmentCompleted: (start: Point, end: Point) => void;
}

export interface SegmentPointerState {
  readonly isPointing: boolean;
  readonly pointedStart: Point | null;
  readonly pointedEnd: Point | null;
}

export default function useSegmentPointer(props: SegmentPointerProps): SegmentPointerState {
  const { cellSize, rowCount: rows, columnCount: cols, containerRef, onSegmentCompleted } = props;

  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const point = {
        x: Math.min(Math.max(Math.floor((event.clientX - container.left) / cellSize), 0), cols - 1),
        y: Math.min(Math.max(Math.floor((event.clientY - container.top) / cellSize), 0), rows - 1),
      };

      setStartPoint(point);
      setEndPoint(point);
    },
    [cellSize, cols, containerRef, rows],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!startPoint) return;
      if (!containerRef.current) return;

      // Compute "hovered" point
      const container = containerRef.current.getBoundingClientRect();

      let point = {
        x: Math.floor((event.clientX - container.left) / cellSize),
        y: Math.floor((event.clientY - container.top) / cellSize),
      };

      let dx = point.x - startPoint.x;
      let dy = point.y - startPoint.y;

      // Limit angle
      const a = Math.round(orientation(startPoint, point) / (Math.PI / 4)) * (Math.PI / 4);

      if (Math.abs(a) === Math.PI / 2) {
        point = {
          x: startPoint.x,
          y: Math.min(Math.max(point.y, 0), rows - 1),
        };
      } else if (Math.abs(a) === Math.PI || a === 0) {
        point = {
          x: Math.min(Math.max(point.x, 0), cols - 1),
          y: startPoint.y,
        };
      } else if (Math.abs(dx) < Math.abs(dy)) {
        point = {
          x: point.x,
          y: startPoint.y + Math.round(dx * Math.tan(a)),
        };
      } else {
        point = {
          x: startPoint.x + Math.round(dy / Math.tan(a)),
          y: point.y,
        };
      }

      // Limit length
      dx = point.x - startPoint.x;
      dy = point.y - startPoint.y;

      if (point.x > cols - 1) {
        point.x = cols - 1;
        point.y = startPoint.y + Math.sign(dy) * (cols - 1 - startPoint.x);
      } else if (point.x < 0) {
        point.x = 0;
        point.y = startPoint.y + Math.sign(dy) * startPoint.x;
      }

      if (point.y > rows - 1) {
        point.x = startPoint.x + Math.sign(dx) * (rows - 1 - startPoint.y);
        point.y = rows - 1;
      } else if (point.y < 0) {
        point.x = startPoint.x + Math.sign(dx) * startPoint.y;
        point.y = 0;
      }

      setEndPoint(point);
    },
    [startPoint, containerRef, cellSize, cols, rows],
  );

  const handlePointerUp = useCallback(() => {
    if (startPoint && endPoint) {
      onSegmentCompleted(startPoint, endPoint);
    }

    setStartPoint(null);
    setEndPoint(null);
  }, [startPoint, endPoint, onSegmentCompleted]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('pointerdown', handlePointerDown);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [containerRef, handlePointerDown]);

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  useEffect(() => {
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  return {
    isPointing: startPoint !== null,
    pointedStart: startPoint,
    pointedEnd: endPoint,
  };
}

import type { Point } from '@/lib/types/point';
import { length, orientation } from '@/lib/utils/segment';
import React from 'react';

export interface GridSegmentProps {
  readonly className?: string;
  readonly start: Point;
  readonly end: Point;
  readonly cellSize: number;
  readonly thickness: number;
}

export default function GridSegment(props: GridSegmentProps) {
  const { className, start, end, cellSize, thickness } = props;
  const d = (cellSize - thickness) / 2;

  return (
    <div
      className={className}
      style={{
        height: thickness,
        width: length(start, end) * cellSize + thickness,
        transform: `translate(${start.x * cellSize + d}px, ${start.y * cellSize + d}px) rotate(${orientation(start, end)}rad)`,
        transformOrigin: `${thickness / 2}px ${thickness / 2}px`,
      }}
    />
  );
}

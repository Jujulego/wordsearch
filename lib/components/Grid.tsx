'use client';

import useSegmentPointer from '@/lib/hooks/useSegmentPointer';
import type { Point } from '@/lib/types/point';
import { orientation, length } from '@/lib/utils/segment';
import clsx from 'clsx';
import React, { useCallback, useRef, useState } from 'react';

export default function Grid({ className, grid }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const [overlays, setOverlays] = useState<(readonly [Point, Point])[]>([]);

  const { pointedStart, pointedEnd } = useSegmentPointer({
    cellSize: 32,
    rowCount: grid.length,
    columnCount: grid[0].length,
    containerRef: gridRef,
    onSegmentCompleted: useCallback((start, end) => {
      if (start.x !== end.x || start.y !== end.y) {
        setOverlays((old) => [...old, [start, end]]);
      }
    }, []),
  });

  return (
    <div
      ref={gridRef}
      className={clsx('relative grid w-fit auto-cols-auto auto-rows-auto select-none', className)}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}:${y}`}
            className="size-8 text-center leading-8"
            data-x={x}
            data-y={y}
            style={{ gridRow: y + 1, gridColumn: x + 1 }}
          >
            {cell}
          </div>
        )),
      )}

      {overlays.map(([start, end], idx) => (
        <div
          key={idx}
          className="pointer-events-none absolute -z-10 h-5 w-full bg-amber-200/50"
          style={{
            width: `${length(start, end)}px`,
            transform: `translate(${start.x * 32 + 6}px, ${start.y * 32 + 6}px) rotate(${orientation(start, end)}rad)`,
            transformOrigin: '10px 10px',
          }}
        />
      ))}

      {pointedStart && pointedEnd && (
        <div
          className="pointer-events-none absolute -z-10 h-5 w-full bg-amber-200/50"
          style={{
            width: `${length(pointedStart, pointedEnd)}px`,
            transform: `translate(${pointedStart.x * 32 + 6}px, ${pointedStart.y * 32 + 6}px) rotate(${orientation(pointedStart, pointedEnd)}rad)`,
            transformOrigin: '10px 10px',
          }}
        />
      )}
    </div>
  );
}

export interface GridProps {
  readonly className?: string;
  readonly grid: readonly (readonly string[])[];
}

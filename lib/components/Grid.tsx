'use client';

import GridSegment from '@/lib/components/GridSegment';
import useSegmentPointer from '@/lib/hooks/useSegmentPointer';
import type { Point } from '@/lib/types/point';
import clsx from 'clsx';
import React, { useCallback, useRef, useState } from 'react';

export default function Grid({ className, grid }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const [overlays, setOverlays] = useState<(readonly [Point, Point])[]>([]);

  const { ongoingSegments } = useSegmentPointer({
    cellSize: 32,
    rowCount: grid.length,
    columnCount: grid[0].length,
    containerRef: gridRef,
    onSegmentCompleted: useCallback((segment) => {
      if (segment[0].x !== segment[1].x || segment[0].y !== segment[1].y) {
        setOverlays((old) => {
          const alreadyExists = old.some(
            (s) =>
              s[0].x === segment[0].x &&
              s[0].y === segment[0].y &&
              s[1].x === segment[1].x &&
              s[1].y === segment[1].y,
          );

          return alreadyExists ? old : [...old, segment];
        });
      }
    }, []),
  });

  return (
    <div
      ref={gridRef}
      className={clsx(
        'relative grid w-fit touch-none auto-cols-auto auto-rows-auto select-none',
        className,
      )}
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
        <GridSegment
          key={idx}
          className="pointer-events-none absolute -z-10 bg-rainbow-200/50 dark:bg-rainbow-500/50"
          cellSize={32}
          thickness={20}
          start={start}
          end={end}
        />
      ))}

      {ongoingSegments.map(([start, end], idx) => (
        <GridSegment
          key={idx}
          className="pointer-events-none absolute -z-10 bg-rainbow-200/50 dark:bg-rainbow-500/50"
          cellSize={32}
          thickness={20}
          start={start}
          end={end}
        />
      ))}
    </div>
  );
}

export interface GridProps {
  readonly className?: string;
  readonly grid: readonly (readonly string[])[];
}

'use client';

import clsx from 'clsx';
import { type PointerEvent, useCallback, useEffect, useState } from 'react';

export default function Grid({ className, grid }: GridProps) {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [overlays, setOverlays] = useState<(readonly [Point, Point])[]>([]);

  const rows = grid.length;
  const cols = grid[0].length;

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const container = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.min(Math.max(Math.floor((event.clientX - container.left) / 32), 0), cols - 1),
      y: Math.min(Math.max(Math.floor((event.clientY - container.top) / 32), 0), rows - 1),
    };

    setStartPoint(point);
    setEndPoint(point);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!startPoint) {
      return;
    }

    // Compute "hovered" point
    const container = event.currentTarget.getBoundingClientRect();

    let point = {
      x: Math.floor((event.clientX - container.left) / 32),
      y: Math.floor((event.clientY - container.top) / 32),
    };

    let dx = point.x - startPoint.x;
    let dy = point.y - startPoint.y;

    // Limit angle
    const a = Math.round(angle(startPoint, point) / (Math.PI / 4)) * (Math.PI / 4);

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
  }, [startPoint]);

  const handlePointerUp = useCallback(() => {
    if (startPoint && endPoint) {
      if (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y) {
        setOverlays((old) => [...old, [startPoint, endPoint]]);
      }
    }

    setStartPoint(null);
    setEndPoint(null);
  }, [startPoint, endPoint]);

  useEffect(() => {
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    }
  }, [handlePointerUp]);

  return (
    <div
      className={clsx('relative grid auto-cols-auto auto-rows-auto w-fit select-none', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {grid.map((row, y) => row.map((cell, x) => (
        <div
          key={`${x}:${y}`}
          className="size-8 text-center leading-8"
          data-x={x}
          data-y={y}
          style={{ gridRow: y + 1, gridColumn: x + 1 }}
        >
          {cell}
        </div>
      )))}

      {overlays.map(([start, end], idx) => (
        <div
          key={idx}
          className="bg-amber-200/50 h-5 absolute w-full -z-10 pointer-events-none"
          style={{
            width: `${length(start, end)}px`,
            transform: `translate(${start.x * 32 + 6}px, ${start.y * 32 + 6}px) rotate(${angle(start, end)}rad)`,
            transformOrigin: '10px 10px',
          }}
        />
      ))}

      { startPoint && endPoint && (
        <div
          className="bg-amber-200/50 h-5 absolute w-full -z-10 pointer-events-none"
          style={{
            width: `${length(startPoint, endPoint)}px`,
            transform: `translate(${startPoint.x * 32 + 6}px, ${startPoint.y * 32 + 6}px) rotate(${angle(startPoint, endPoint)}rad)`,
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

export interface Point {
  readonly x: number;
  readonly y: number;
}

function angle(start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return 0;
  }

  if (dx < 0 && dy === 0) {
    return -Math.PI;
  }

  return Math.sign(dy) * Math.acos(dx / Math.sqrt(dx * dx + dy * dy));
}

function length(start: Point, end: Point) {
  const dx = (end.x - start.x) * 32;
  const dy = (end.y - start.y) * 32;

  return Math.sqrt(dx * dx + dy * dy) + 20;
}
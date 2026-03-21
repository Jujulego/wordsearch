'use client';

import clsx from 'clsx';
import { type PointerEvent, useCallback, useEffect, useState } from 'react';

export default function Grid({ className, grid }: GridProps) {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [overlays, setOverlays] = useState<(readonly [Point, Point])[]>([]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const container = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.floor((event.clientX - container.left) / 32),
      y: Math.floor((event.clientY - container.top) / 32),
    };

    setStartPoint(point);
    setEndPoint(point);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const container = event.currentTarget.getBoundingClientRect();

    setEndPoint({
      x: Math.floor((event.clientX - container.left) / 32),
      y: Math.floor((event.clientY - container.top) / 32),
    });
  }, []);

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
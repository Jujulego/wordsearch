import type { Point } from '@/lib/types/point';
import type { Size } from '@/lib/types/size';

export function randomPointIn(size: Size): Point {
  return {
    x: Math.floor(Math.random() * (size.w - 0.001)),
    y: Math.floor(Math.random() * (size.h - 0.001)),
  };
}

export function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * (items.length - 0.001))];
}

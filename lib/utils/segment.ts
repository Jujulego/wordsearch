import type { Point } from '@/lib/types/point';

export function orientation(start: Point, end: Point) {
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

export function length(start: Point, end: Point) {
  const dx = (end.x - start.x) * 32;
  const dy = (end.y - start.y) * 32;

  return Math.sqrt(dx * dx + dy * dy) + 20;
}

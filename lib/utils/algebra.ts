import type { Point } from '@/lib/types/point';
import type { Vector } from '@/lib/types/vector';

export function add(pt: Point, v: Vector): Point {
  return { x: pt.x + v.dx, y: pt.y + v.dy };
}

export function mul(k: number, v: Vector): Vector {
  return { dx: k * v.dx, dy: k * v.dy };
}

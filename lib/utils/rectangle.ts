import type { Point } from '@/lib/types/point';
import type { Size } from '@/lib/types/size';

export function isInsideRectangle(size: Size, pt: Point): boolean {
  return pt.x >= 0 && pt.x < size.w && pt.y >= 0 && pt.y < size.h;
}

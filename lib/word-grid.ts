import { prisma } from '@/lib/prisma.client';
import type { Size } from '@/lib/types/size';
import type { Vector } from '@/lib/types/vector';
import { add, mul } from '@/lib/utils/algebra';
import { randomItem, randomPointIn } from '@/lib/utils/random';
import { isInsideRectangle } from '@/lib/utils/rectangle';

export type WordGrid = readonly (readonly string[])[];

/* prettier-ignore */
const DIRECTIONS: readonly Vector[] = [
  { dx:  1, dy:  0 },
  { dx:  1, dy:  1 },
  { dx:  0, dy:  1 },
  { dx: -1, dy:  1 },
  { dx: -1, dy:  0 },
  { dx: -1, dy: -1 },
  { dx:  0, dy: -1 },
  { dx:  1, dy: -1 },
];

export async function generateWordGrid(size: Size, wordCount: number): Promise<WordGrid> {
  const grid = initialiseWordGrid(size, '_');
  const words = new Set<string>();

  while (wordCount > 0) {
    let pattern = '';

    const start = randomPointIn(size);
    pattern += grid[start.y][start.x];

    const dir = randomItem(DIRECTIONS.filter((d) => isInsideRectangle(size, add(start, d))));
    let point = add(start, dir);

    while (isInsideRectangle(size, point)) {
      pattern += grid[point.y][point.x];
      point = add(point, dir);
    }

    pattern = pattern.slice(0, 5 + Math.floor(Math.random() * (pattern.length - 5.001)));
    const maxLength = pattern.length;

    pattern = pattern.replace(/_+$/, '%');

    let result: { word: string }[] = await prisma.$queryRaw`
      SELECT word FROM "Word"
      WHERE word ILIKE ${pattern}
        AND length(word) BETWEEN 3 AND ${maxLength}
      ORDER BY random()
      LIMIT 20
    `;

    result = result.filter((r) => !words.has(r.word));

    if (result.length > 0) {
      const word = result[0].word;
      words.add(word);

      console.log({ pattern, word, maxLength });

      for (let i = 0; i < word.length; i++) {
        const point = add(start, mul(i, dir));
        grid[point.y][point.x] = word[i].toUpperCase();
      }

      --wordCount;
    }
  }

  return grid;
}

function initialiseWordGrid(size: Size, character: string): string[][] {
  character = character.slice(0, 1).toUpperCase();

  const grid: string[][] = [];

  for (let i = 0; i < size.h; i++) {
    grid.push([]);

    for (let j = 0; j < size.w; j++) {
      grid[i].push(character);
    }
  }

  return grid;
}

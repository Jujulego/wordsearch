import Grid from '@/lib/components/Grid';

const grid: string[][] = [];

for (let i = 0; i < 25; i++) {
  grid.push([]);

  for (let j = 0; j < 15; j++) {
    grid[i].push('A');
  }
}

export default function Home() {
  return <Grid className="m-auto" grid={grid} />;
}

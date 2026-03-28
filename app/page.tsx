import Grid from '@/lib/Grid';

const grid = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['X', 'Y', 'Z', 'A', 'B', 'C'],
  ['D', 'E', 'F', 'G', 'H', 'I'],
];

export default function Home() {
  return <Grid className="m-auto" grid={grid} />;
}

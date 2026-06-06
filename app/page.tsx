import Grid from '@/lib/components/Grid';
import { generateWordGrid } from '@/lib/word-grid';
import { connection } from 'next/server';

export default async function Home() {
  await connection();
  const grid = await generateWordGrid({ w: 15, h: 25 }, 60);

  return <Grid className="m-auto" grid={grid} />;
}

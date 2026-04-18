import fs from 'node:fs/promises';
import path from 'node:path';

// Read input file
const data = await fs.readFile(path.resolve(import.meta.dirname, './words.json'), {
  encoding: 'utf8',
});
const words = JSON.parse(data);

// Prepare output file
const output = await fs.open(path.resolve(import.meta.dirname, './words.jsonl'), 'w');

// Search words
const format = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

console.log('0,00 %');

for (let i = 0; i < words.length; i++) {
  const word = words[i];

  if (word === '') {
    continue;
  }

  let res = await fetch(
    `https://freedictionaryapi.com/api/v1/entries/fr/${encodeURIComponent(word)}`,
  );

  console.log(`\x1b[2A\x1b[K${word}`);
  console.log(`${format.format(i / words.length)}`);

  while (res.status === 429) {
    console.log(`\x1b[2A\x1b[K${word}: \x1b[33mrate limited...\x1b[0m`);
    console.log(format.format(i / words.length));

    await new Promise((resolve) => setTimeout(resolve, 300_000));
    res = await fetch(
      `https://freedictionaryapi.com/api/v1/entries/fr/${encodeURIComponent(word)}`,
    );
  }

  if (res.status === 200) {
    const data = await res.json();

    for (const entry of data.entries) {
      if (entry.language.code === 'fr') {
        await fs.writeFile(output, JSON.stringify({ word, ...entry }) + '\n', { encoding: 'utf8' });
      }
    }
  }
}

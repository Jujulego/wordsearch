import fs from 'node:fs/promises';
import path from 'node:path';
import rl from 'node:readline/promises';

// Open input file
const input = await fs.open(path.resolve(import.meta.dirname, './words.jsonl'), 'r');
const stream = rl.createInterface({
  input: input.createReadStream(),
  crlfDelay: Infinity,
});

// Filter words
const wordSet = new Set();

function addWord(word) {
  word = word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (word.match(/^[a-z]+$/)) {
    wordSet.add(word);
  }
}

for await (const line of stream) {
  const word = JSON.parse(line);

  if (word.language.code !== 'fr') continue;
  if (word.partOfSpeech === 'name') continue;

  addWord(word.word);

  for (const form of word.forms) {
    addWord(form.word);
  }
}

const words = Array.from(wordSet);
words.sort((a, b) => a.localeCompare(b));

console.log(words.length);

await fs.writeFile('words.json', JSON.stringify(words), 'utf8');

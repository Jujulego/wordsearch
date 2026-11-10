import type { PrismaClient } from '@/lib/prisma/client';
import { parse } from 'csv-parse';
import { pipeline } from 'node:stream/promises';

const SEED_ID = '01-load-lexique4-words';

/**
 * Imports words from Lexique4 into the database.
 * @see https://www.lexique.org/
 */
export async function loadLexique4Words(prisma: PrismaClient) {
  if (await prisma.seed.count({ where: { id: SEED_ID } })) {
    console.log('Lexique4 words already loaded');
    return;
  }

  console.log('Loading Lexique4 words...');
  const res = await fetch(
    'https://www.lexique.org/django/data/177__2433,177__2434,177__2435,177__2436,177__2437,177__2438,177__2439,177__2440,177__2441,177__2442,177__2443,177__2444,177__2445,177__2446,177__2447,177__2448,177__2449,177__2450,177__2451,177__2452,177__2453,177__2454,177__2455,177__2456,177__2457,177__2458,177__2459,177__2460,177__2461,177__2462,177__2463,177__2464,177__2465,177__2466,177__2467,177__2468?columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=word&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=%5E%5Ba-z%5D%2B%24&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B8%5D%5Bdata%5D=8&columns%5B8%5D%5Bname%5D=&columns%5B9%5D%5Bdata%5D=9&columns%5B9%5D%5Bname%5D=&columns%5B10%5D%5Bdata%5D=10&columns%5B10%5D%5Bname%5D=&columns%5B11%5D%5Bdata%5D=11&columns%5B11%5D%5Bname%5D=&columns%5B12%5D%5Bdata%5D=12&columns%5B12%5D%5Bname%5D=&columns%5B13%5D%5Bdata%5D=13&columns%5B13%5D%5Bname%5D=&columns%5B14%5D%5Bdata%5D=14&columns%5B14%5D%5Bname%5D=&columns%5B15%5D%5Bdata%5D=15&columns%5B15%5D%5Bname%5D=&columns%5B16%5D%5Bdata%5D=16&columns%5B16%5D%5Bname%5D=&columns%5B17%5D%5Bdata%5D=17&columns%5B17%5D%5Bname%5D=&columns%5B18%5D%5Bdata%5D=18&columns%5B18%5D%5Bname%5D=&columns%5B19%5D%5Bdata%5D=19&columns%5B19%5D%5Bname%5D=&columns%5B20%5D%5Bdata%5D=20&columns%5B20%5D%5Bname%5D=&columns%5B21%5D%5Bdata%5D=21&columns%5B21%5D%5Bname%5D=&columns%5B22%5D%5Bdata%5D=22&columns%5B22%5D%5Bname%5D=&columns%5B23%5D%5Bdata%5D=23&columns%5B23%5D%5Bname%5D=&columns%5B24%5D%5Bdata%5D=24&columns%5B24%5D%5Bname%5D=&columns%5B25%5D%5Bdata%5D=25&columns%5B25%5D%5Bname%5D=&columns%5B26%5D%5Bdata%5D=26&columns%5B26%5D%5Bname%5D=&columns%5B27%5D%5Bdata%5D=27&columns%5B27%5D%5Bname%5D=&columns%5B28%5D%5Bdata%5D=28&columns%5B28%5D%5Bname%5D=&columns%5B29%5D%5Bdata%5D=29&columns%5B29%5D%5Bname%5D=&columns%5B30%5D%5Bdata%5D=30&columns%5B30%5D%5Bname%5D=&columns%5B31%5D%5Bdata%5D=31&columns%5B31%5D%5Bname%5D=&columns%5B32%5D%5Bdata%5D=32&columns%5B32%5D%5Bname%5D=&columns%5B33%5D%5Bdata%5D=33&columns%5B33%5D%5Bname%5D=&columns%5B34%5D%5Bdata%5D=34&columns%5B34%5D%5Bname%5D=&columns%5B35%5D%5Bdata%5D=35&columns%5B35%5D%5Bname%5D=&columns%5B36%5D%5Bdata%5D=36&columns%5B36%5D%5Bname%5D=&start=0&search%5Bvalue%5D=&export_mode=TSV&export_post=1',
  );

  await prisma.word.updateMany({
    data: { frequency: 0 },
  });

  let count = 0;

  await pipeline(
    res.body!,
    parse<Lexique4Record>({ columns: true, delimiter: '\t', trim: true }),
    async function* (source) {
      let promises: PromiseLike<unknown>[] = [];

      for await (const record of source) {
        promises.push(
          prisma.word.upsert({
            where: {
              word: record.ortho,
            },
            create: {
              word: record.ortho,
              frequency: parseFloat(record.Lexique4__10_FreqMot),
            },
            update: {
              frequency: { increment: parseFloat(record.Lexique4__10_FreqMot) },
            },
          }),
        );

        if (++count % 1000 === 0) {
          console.log(`Processed ${count} records`);
        }

        if (promises.length > 100) {
          await Promise.all(promises);
          promises = [];
        }
      }

      await Promise.all(promises);
    },
  );

  console.log(`Processed ${count} records`);

  await prisma.word.deleteMany({
    where: { frequency: 0 },
  });

  await prisma.seed.create({
    data: {
      id: SEED_ID,
    },
  });
}

interface Lexique4Record {
  readonly ortho: string;
  readonly Lexique4__2_Phono: string;
  readonly Lexique4__3_Phono_IPA: string;
  readonly Lexique4__4_Lemme: string;
  readonly Lexique4__5_Cgram: string;
  readonly Lexique4__6_CgramOrtho: string;
  readonly Lexique4__7_Genre: string;
  readonly Lexique4__8_Nombre: string;
  readonly Lexique4__9_InfoVER: string;
  readonly Lexique4__10_FreqMot: string;
  readonly Lexique4__11_FreqOrtho: string;
  readonly Lexique4__12_FreqLemme: string;
  readonly Lexique4__13_CDOrtho: string;
  readonly Lexique4__14_IsLem: string;
  readonly Lexique4__15_NbLettres: string;
  readonly Lexique4__16_NbPhons: string;
  readonly Lexique4__17_OLD20: string;
  readonly Lexique4__18_PLD20: string;
  readonly Lexique4__19_CVOrtho: string;
  readonly Lexique4__20_CVPhono: string;
  readonly Lexique4__21_VoisOrtho: string;
  readonly Lexique4__22_VoisPhono: string;
  readonly Lexique4__23_NbHomog: string;
  readonly Lexique4__24_NbHomoph: string;
  readonly Lexique4__25_SyllPhono: string;
  readonly Lexique4__26_SyllNb: string;
  readonly Lexique4__27_SyllCV: string;
  readonly Lexique4__28_PUOrtho: string;
  readonly Lexique4__29_PUPhon: string;
  readonly Lexique4__30_MorphoBase: string;
  readonly Lexique4__31_MorphoStruct: string;
  readonly Lexique4__32_MorphoDecomp: string;
  readonly Lexique4__33_Preval: string;
  readonly Lexique4__34_PrevalNb: string;
  readonly Lexique4__35_RT_FLP: string;
  readonly Lexique4__36_zRT_FLP: string;
  readonly Lexique4__37_Err_FLP: string;
}

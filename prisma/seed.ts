import { PrismaClient } from '@/lib/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import words from '@/words/words.json' with { type: 'json' };

import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
  }),
});

async function main() {
  try {
    await prisma.word.createMany({
      data: words.map((word) => ({ word })),
      skipDuplicates: true,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main();

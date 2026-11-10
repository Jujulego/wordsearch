import { PrismaClient } from '@/lib/prisma/client';
import { loadLexique4Words } from '@/prisma/seeds/01-load-lexique4-words';
import { PrismaNeon } from '@prisma/adapter-neon';

import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
  }),
});

try {
  await loadLexique4Words(prisma);
} finally {
  await prisma.$disconnect();
}

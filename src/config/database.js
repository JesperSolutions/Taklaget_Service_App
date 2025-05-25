import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Handle connection events
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

process.on('exit', async () => {
  await prisma.$disconnect();
});

export default prisma;
import { PrismaClient } from '../../src/generated/prisma';
import { PromptService } from './services/PromptService';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  const promptService = new PromptService(prisma);
  await promptService.createInitialPrompts();
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

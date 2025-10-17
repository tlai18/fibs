const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function clearDatabase() {
  console.log('🗑️  Clearing database...');
  
  try {
    // Delete in correct order (respecting foreign key constraints)
    await prisma.roundSummary.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.response.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.roundPrompt.deleteMany();
    await prisma.round.deleteMany();
    await prisma.player.deleteMany();
    await prisma.party.deleteMany();
    // Keep prompts - don't delete them
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

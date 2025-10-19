const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function clearPromptsOnly() {
  console.log('🗑️  Clearing prompts from database...');
  
  try {
    // First, delete round prompts that reference the prompts
    await prisma.roundPrompt.deleteMany();
    console.log('✅ Cleared round_prompts table');
    
    // Then delete all prompts
    const deletedPrompts = await prisma.prompt.deleteMany();
    console.log(`✅ Deleted ${deletedPrompts.count} prompts from database`);
    
    console.log('✅ All prompts cleared successfully!');
    console.log('💡 Run "npm run db:seed" to repopulate with fresh prompts');
  } catch (error) {
    console.error('❌ Error clearing prompts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearPromptsOnly();

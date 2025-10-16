import { PrismaClient } from '../../../src/generated/prisma';

const CODE_LENGTH = 4;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export async function generatePartyCode(prisma: PrismaClient): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateRandomCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique party code');
    }
  } while (await codeExists(prisma, code));

  return code;
}

function generateRandomCode(): string {
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

async function codeExists(prisma: PrismaClient, code: string): Promise<boolean> {
  const existingParty = await prisma.party.findUnique({
    where: { code },
    select: { id: true }
  });
  
  return !!existingParty;
}

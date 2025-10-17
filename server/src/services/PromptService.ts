import { PrismaClient } from '../../../src/generated/prisma';
import { PROMPTS } from '../data/prompts';
import { selectRandomFromAvailable } from '../utils/promptUtils';

export class PromptService {
  constructor(private prisma: PrismaClient) {}

  async selectPrompt(usedPromptIds: number[]): Promise<any> {
    // Get all available prompts (not used in this party)
    const availablePrompts = await this.prisma.prompt.findMany({
      where: {
        id: { notIn: usedPromptIds },
        enabled: true
      }
    });

    if (availablePrompts.length === 0) {
      // If all prompts have been used, reset and use any prompt
      const allPrompts = await this.prisma.prompt.findMany({
        where: { enabled: true }
      });
      
      if (allPrompts.length === 0) {
        throw new Error('No prompts available');
      }

      return selectRandomFromAvailable(allPrompts);
    }

    return selectRandomFromAvailable(availablePrompts);
  }

  async getPromptForPlayer(roundId: string, playerId: string): Promise<{ text: string; role: string }> {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        roundId_playerId: {
          roundId,
          playerId
        }
      },
      include: {
        round: {
          include: { 
            prompt: {
              include: { prompt: true }
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (!assignment.round.prompt) {
      throw new Error('Round prompt not found');
    }

    const actualPrompt = assignment.round.prompt.prompt;

    // During the answer phase, the liar doesn't know they're the liar
    // They get the decoy prompt text but think they're a truth-teller
    if (assignment.round.status === 'answer' && assignment.role === 'liar') {
      return {
        text: actualPrompt.textDecoy, // Give them the false prompt
        role: 'truth' // Hide the fact that they're the liar
      };
    }

    // During discussion phase, show the true prompt to everyone
    if (assignment.round.status === 'discussion') {
      return {
        text: actualPrompt.textTrue,
        role: assignment.role // Now show the actual role
      };
    }

    // For all other cases, return the actual assignment
    const promptText = assignment.promptVariant === 'true' 
      ? actualPrompt.textTrue 
      : actualPrompt.textDecoy;

    return {
      text: promptText,
      role: assignment.role
    };
  }

  async getTruePrompt(roundId: string): Promise<{ textTrue: string; textDecoy: string }> {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: { 
        prompt: {
          include: { prompt: true }
        }
      }
    });

    if (!round || !round.prompt || !round.prompt.prompt) {
      throw new Error('Round or prompt not found');
    }

    return {
      textTrue: round.prompt.prompt.textTrue,
      textDecoy: round.prompt.prompt.textDecoy
    };
  }

  async createInitialPrompts() {
    // Use modular prompts from data/prompts.ts
    for (const promptData of PROMPTS) {
      await this.prisma.prompt.create({
        data: promptData
      });
    }

    console.log(`Created ${PROMPTS.length} initial prompts`);
  }
}

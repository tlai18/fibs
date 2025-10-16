import { PrismaClient } from '../../../src/generated/prisma';

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

      // Weight by difficulty (higher difficulty = less likely to be selected)
      const weightedPrompts = this.weightPromptsByDifficulty(allPrompts);
      return this.selectRandomWeighted(weightedPrompts);
    }

    // Weight by difficulty (higher difficulty = less likely to be selected)
    const weightedPrompts = this.weightPromptsByDifficulty(availablePrompts);
    return this.selectRandomWeighted(weightedPrompts);
  }

  private weightPromptsByDifficulty(prompts: any[]): { prompt: any; weight: number }[] {
    return prompts.map(prompt => {
      // Difficulty 1 = weight 5, difficulty 5 = weight 1
      const weight = 6 - prompt.difficulty;
      return { prompt, weight };
    });
  }

  private selectRandomWeighted(weightedItems: { prompt: any; weight: number }[]): any {
    const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedItems) {
      random -= item.weight;
      if (random <= 0) {
        return item.prompt;
      }
    }

    // Fallback to last item
    return weightedItems[weightedItems.length - 1].prompt;
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
    const prompts = [
      // Movies
      { category: 'Movies', textTrue: 'Name a Pixar movie.', textDecoy: 'Name an animated movie.', difficulty: 1 },
      { category: 'Movies', textTrue: 'Name a Marvel movie.', textDecoy: 'Name a superhero movie.', difficulty: 1 },
      { category: 'Movies', textTrue: 'Name a James Bond movie.', textDecoy: 'Name a spy movie.', difficulty: 2 },
      { category: 'Movies', textTrue: 'Name a movie with Tom Hanks.', textDecoy: 'Name a movie with Tom Cruise.', difficulty: 2 },
      { category: 'Movies', textTrue: 'Name a Quentin Tarantino movie.', textDecoy: 'Name a violent movie.', difficulty: 3 },

      // Foods
      { category: 'Foods', textTrue: 'Name a type of pasta.', textDecoy: 'Name an Italian food.', difficulty: 1 },
      { category: 'Foods', textTrue: 'Name a citrus fruit.', textDecoy: 'Name a sour fruit.', difficulty: 1 },
      { category: 'Foods', textTrue: 'Name a type of cheese.', textDecoy: 'Name a dairy product.', difficulty: 2 },
      { category: 'Foods', textTrue: 'Name a root vegetable.', textDecoy: 'Name a vegetable.', difficulty: 2 },
      { category: 'Foods', textTrue: 'Name a type of mushroom.', textDecoy: 'Name a fungus.', difficulty: 3 },

      // Cities
      { category: 'Cities', textTrue: 'Name a city in California.', textDecoy: 'Name a city in the US.', difficulty: 1 },
      { category: 'Cities', textTrue: 'Name a European capital.', textDecoy: 'Name a capital city.', difficulty: 2 },
      { category: 'Cities', textTrue: 'Name a city in Japan.', textDecoy: 'Name a city in Asia.', difficulty: 2 },
      { category: 'Cities', textTrue: 'Name a city in Australia.', textDecoy: 'Name a city in Oceania.', difficulty: 3 },
      { category: 'Cities', textTrue: 'Name a city with over 10 million people.', textDecoy: 'Name a large city.', difficulty: 3 },

      // Animals
      { category: 'Animals', textTrue: 'Name a type of bear.', textDecoy: 'Name a large mammal.', difficulty: 1 },
      { category: 'Animals', textTrue: 'Name a bird of prey.', textDecoy: 'Name a bird.', difficulty: 2 },
      { category: 'Animals', textTrue: 'Name a marine mammal.', textDecoy: 'Name an ocean animal.', difficulty: 2 },
      { category: 'Animals', textTrue: 'Name a marsupial.', textDecoy: 'Name an Australian animal.', difficulty: 3 },
      { category: 'Animals', textTrue: 'Name a venomous snake.', textDecoy: 'Name a dangerous animal.', difficulty: 3 },

      // Sports
      { category: 'Sports', textTrue: 'Name a sport played with a ball.', textDecoy: 'Name a team sport.', difficulty: 1 },
      { category: 'Sports', textTrue: 'Name an Olympic sport.', textDecoy: 'Name a competitive sport.', difficulty: 2 },
      { category: 'Sports', textTrue: 'Name a winter sport.', textDecoy: 'Name a cold weather sport.', difficulty: 2 },
      { category: 'Sports', textTrue: 'Name a combat sport.', textDecoy: 'Name a fighting sport.', difficulty: 3 },
      { category: 'Sports', textTrue: 'Name a sport with a net.', textDecoy: 'Name a court sport.', difficulty: 3 },

      // Technology
      { category: 'Technology', textTrue: 'Name a programming language.', textDecoy: 'Name a computer language.', difficulty: 2 },
      { category: 'Technology', textTrue: 'Name a social media platform.', textDecoy: 'Name a website.', difficulty: 1 },
      { category: 'Technology', textTrue: 'Name a video game console.', textDecoy: 'Name a gaming device.', difficulty: 2 },
      { category: 'Technology', textTrue: 'Name a smartphone brand.', textDecoy: 'Name a tech company.', difficulty: 2 },
      { category: 'Technology', textTrue: 'Name a cloud computing service.', textDecoy: 'Name an internet service.', difficulty: 4 },

      // Music
      { category: 'Music', textTrue: 'Name a Beatles song.', textDecoy: 'Name a classic rock song.', difficulty: 2 },
      { category: 'Music', textTrue: 'Name a musical instrument.', textDecoy: 'Name something that makes music.', difficulty: 1 },
      { category: 'Music', textTrue: 'Name a music genre.', textDecoy: 'Name a type of music.', difficulty: 2 },
      { category: 'Music', textTrue: 'Name a Grammy-winning artist.', textDecoy: 'Name a famous musician.', difficulty: 3 },
      { category: 'Music', textTrue: 'Name a classical composer.', textDecoy: 'Name a famous composer.', difficulty: 4 },

      // Nature
      { category: 'Nature', textTrue: 'Name a type of tree.', textDecoy: 'Name a plant.', difficulty: 1 },
      { category: 'Nature', textTrue: 'Name a natural disaster.', textDecoy: 'Name something dangerous.', difficulty: 2 },
      { category: 'Nature', textTrue: 'Name a type of rock.', textDecoy: 'Name something found underground.', difficulty: 3 },
      { category: 'Nature', textTrue: 'Name a constellation.', textDecoy: 'Name something in the sky.', difficulty: 4 },
      { category: 'Nature', textTrue: 'Name a chemical element.', textDecoy: 'Name something scientific.', difficulty: 4 },

      // Entertainment
      { category: 'Entertainment', textTrue: 'Name a TV show on Netflix.', textDecoy: 'Name a streaming show.', difficulty: 2 },
      { category: 'Entertainment', textTrue: 'Name a Broadway musical.', textDecoy: 'Name a musical.', difficulty: 3 },
      { category: 'Entertainment', textTrue: 'Name a podcast.', textDecoy: 'Name an audio show.', difficulty: 2 },
      { category: 'Entertainment', textTrue: 'Name a YouTube channel.', textDecoy: 'Name an online channel.', difficulty: 3 },
      { category: 'Entertainment', textTrue: 'Name a comedy special.', textDecoy: 'Name a comedy show.', difficulty: 3 }
    ];

    for (const promptData of prompts) {
      await this.prisma.prompt.create({
        data: promptData
      });
    }

    console.log(`Created ${prompts.length} initial prompts`);
  }
}

import { PrismaClient } from '../../../src/generated/prisma';
import { generatePartyCode } from '../utils/partyCode';
import { PromptService } from './PromptService';
import { getRandomAvatar } from '../constants/avatars';

export class GameService {
  constructor(
    private prisma: PrismaClient,
    private promptService: PromptService = new PromptService(prisma)
  ) {}

  // Helper function to ensure only one host per party
  private async ensureSingleHost(partyId: string, excludePlayerId?: string) {
    const activeHosts = await this.prisma.player.findMany({
      where: {
        partyId,
        isHost: true,
        isActive: true,
        ...(excludePlayerId && { id: { not: excludePlayerId } })
      }
    });

    // If multiple hosts found, keep only the first one (oldest)
    if (activeHosts.length > 1) {
      console.log(`Found ${activeHosts.length} hosts in party ${partyId}, keeping only the first one`);
      const [keepHost, ...removeHosts] = activeHosts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      await this.prisma.player.updateMany({
        where: {
          id: { in: removeHosts.map(h => h.id) }
        },
        data: { isHost: false }
      });

      // Update party hostId to match the kept host
      await this.prisma.party.update({
        where: { id: partyId },
        data: { hostId: keepHost.id }
      });
    }
  }

  async createParty(nickname: string, avatar: string, socketId: string) {
    // Check if this socket is already connected to any party
    const existingPlayer = await this.prisma.player.findFirst({
      where: { socketId, isActive: true },
      include: { party: true }
    });
    
    if (existingPlayer) {
      throw new Error(`You are already connected to party ${existingPlayer.party.code}`);
    }

    const code = await generatePartyCode(this.prisma);
    
    // Use a transaction to create party and host player atomically
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the party first with null hostId
      const party = await tx.party.create({
        data: {
          code,
          hostId: null, // Will be set after creating the host player
        },
      });

      // Create the host player
      const hostPlayer = await tx.player.create({
        data: {
          partyId: party.id,
          nickname,
          avatar,
          isHost: true,
          socketId,
        },
      });

      // Update the party with the actual host ID
      const updatedParty = await tx.party.update({
        where: { id: party.id },
        data: { hostId: hostPlayer.id },
        include: {
          players: true,
          rounds: {
            include: { summary: true },
            orderBy: { number: 'desc' },
            take: 1
          }
        }
      });

      return {
        party: updatedParty,
        player: hostPlayer
      };
    });

    return result;
  }

  async joinParty(code: string, nickname: string, avatar: string, socketId: string) {
    const party = await this.prisma.party.findUnique({
      where: { code },
      include: { players: true }
    });

    if (!party) {
      throw new Error('Party not found');
    }

    if (party.status !== 'lobby') {
      throw new Error('Game already in progress');
    }

    // Check if this socket is already connected to this party
    const existingPlayerWithSocket = party.players.find(p => p.socketId === socketId && p.isActive);
    if (existingPlayerWithSocket) {
      throw new Error('You are already connected to this party');
    }

    // Check if nickname is already taken by an active player
    const existingPlayer = party.players.find(p => p.nickname === nickname && p.isActive);
    if (existingPlayer) {
      throw new Error('Nickname already taken');
    }

    // If there's an inactive player with this nickname, remove them first
    const inactivePlayer = party.players.find(p => p.nickname === nickname && !p.isActive);
    if (inactivePlayer) {
      console.log('Removing inactive player with nickname:', nickname);
      await this.prisma.player.delete({
        where: { id: inactivePlayer.id }
      });
    }

    const player = await this.prisma.player.create({
      data: {
        partyId: party.id,
        nickname,
        avatar,
        socketId,
      },
    });

    const updatedParty = await this.prisma.party.findUnique({
      where: { id: party.id },
      include: {
        players: true,
        rounds: {
          include: { summary: true },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    return {
      party: updatedParty!,
      player
    };
  }

  async startNewRound(partyCode: string, hostSocketId: string, gameMode: 'classic' | 'custom' = 'classic') {
    try {
      console.log(`startNewRound called: partyCode=${partyCode}, hostSocketId=${hostSocketId}`);
      
      const party = await this.prisma.party.findUnique({
        where: { code: partyCode },
        include: { players: { where: { isActive: true } } }
      });

      if (!party) {
        throw new Error('Party not found');
      }

      const hostPlayer = party.players.find(p => p.socketId === hostSocketId);
      if (!hostPlayer || !hostPlayer.isHost) {
        throw new Error('Only host can start the game');
      }

      if (party.players.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      console.log(`Party validation passed: ${party.players.length} players`);

      // Update party with game mode
      await this.prisma.party.update({
        where: { id: party.id },
        data: { 
          gameMode,
          status: 'playing'
        }
      });

      // Get next round number
      const lastRound = await this.prisma.round.findFirst({
        where: { partyId: party.id },
        orderBy: { number: 'desc' }
      });
      const roundNumber = (lastRound?.number || 0) + 1;

      console.log(`Creating round ${roundNumber} in ${gameMode} mode`);

      if (gameMode === 'classic') {
        // Classic mode: Use database prompts
        const prompt = await this.promptService.selectPrompt(party.usedPromptIds);
        const roleAssignments = this.assignRoles(party.players);
        
        console.log(`Selected prompt ${prompt.id}, assigned ${roleAssignments.assignments.length} roles`);

        // Create round with database prompt
        const round = await this.prisma.round.create({
          data: {
            partyId: party.id,
            number: roundNumber,
            liarPlayerId: roleAssignments.liar?.id || null,
            stealth: false,
            isCustomPrompt: false,
            status: 'answer', // Start directly in answer phase
          },
        });

        // Create round-prompt relationship
        await this.prisma.roundPrompt.create({
          data: {
            roundId: round.id,
            promptId: prompt.id,
          },
        });

        return this.createRoundResult(round, party, roleAssignments.assignments);
      } else {
        // Custom mode: Start with prompt creation phase
        const promptCreator = this.getPromptCreator(roundNumber, party.players);
        const roleAssignments = this.assignRoles(party.players, promptCreator.id);
        
        console.log(`Custom mode: ${promptCreator.nickname} will create the prompt`);

        // Create round in prompt-creation phase
        const round = await this.prisma.round.create({
          data: {
            partyId: party.id,
            number: roundNumber,
            liarPlayerId: roleAssignments.liar?.id || null,
            promptCreatorId: promptCreator.id,
            stealth: false,
            isCustomPrompt: true,
            status: 'prompt-creation', // Start in prompt creation phase
          },
        });

        // Create assignments without prompt yet
        await this.createAssignments(round.id, roleAssignments.assignments);

        return {
          round,
          party: await this.getPartyState(partyCode),
          assignments: roleAssignments.assignments,
          promptCreator
        };
      }
    } catch (error) {
      console.error('Error in startNewRound:', error);
      throw error;
    }
  }

  private assignRoles(players: any[], excludePlayerId?: string) {
    // 10% chance of No Liar round (everyone gets truth prompt)
    const isNoLiarRound = Math.random() < 0.1;

    if (isNoLiarRound) {
      console.log('🎯 No Liar round! Everyone gets the truth prompt.');
      return {
        liar: null,
        truths: players,
        stealth: false,
        isNoLiarRound: true,
        assignments: players.map(player => ({
          playerId: player.id,
          role: 'truth' as const,
          promptVariant: 'true' as const
        }))
      };
    }

    // Regular round with one liar
    // Exclude the prompt creator from being selected as liar
    const eligiblePlayers = excludePlayerId 
      ? players.filter(p => p.id !== excludePlayerId)
      : players;
    
    if (eligiblePlayers.length === 0) {
      // If only prompt creator is playing, make it a no-liar round
      console.log('🎯 Only prompt creator playing, making it a no-liar round.');
      return {
        liar: null,
        truths: players,
        stealth: false,
        isNoLiarRound: true,
        assignments: players.map(player => ({
          playerId: player.id,
          role: 'truth' as const,
          promptVariant: 'true' as const
        }))
      };
    }
    
    const shuffled = [...eligiblePlayers].sort(() => Math.random() - 0.5);
    const liar = shuffled[0];
    const truths = players.filter(p => p.id !== liar.id);

    return {
      liar,
      truths,
      stealth: false,
      isNoLiarRound: false,
      assignments: [
        // Liar assignment
        {
          playerId: liar.id,
          role: 'liar' as const,
          promptVariant: 'decoy' as const
        },
        // Truth assignments
        ...truths.map(player => ({
          playerId: player.id,
          role: 'truth' as const,
          promptVariant: 'true' as const
        }))
      ]
    };
  }


  async submitAnswer(partyCode: string, socketId: string, text: string) {
    console.log(`submitAnswer called: partyCode=${partyCode}, socketId=${socketId}, textLength=${text.length}`);
    
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: {
        rounds: {
          where: { status: 'answer' },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party) {
      console.log(`Party not found for code: ${partyCode}`);
      throw new Error('Party not found');
    }

    if (!party.rounds[0]) {
      console.log(`No active answer round found for party: ${partyCode}`);
      throw new Error('No active round found');
    }

    const player = await this.prisma.player.findFirst({
      where: { socketId, partyId: party.id }
    });

    if (!player) {
      console.log(`Player not found: socketId=${socketId}, partyId=${party.id}`);
      // Let's also check if there are any players in this party
      const allPlayers = await this.prisma.player.findMany({
        where: { partyId: party.id }
      });
      console.log(`All players in party ${partyCode}:`, allPlayers.map(p => ({ id: p.id, nickname: p.nickname, socketId: p.socketId })));
      throw new Error('Player not found');
    }

    console.log(`Found player: ${player.nickname} (${player.id}) for socket ${socketId}`);

    const round = party.rounds[0];

    // Check if player already submitted
    const existingResponse = await this.prisma.response.findUnique({
      where: {
        roundId_playerId: {
          roundId: round.id,
          playerId: player.id
        }
      }
    });

    if (existingResponse) {
      throw new Error('Answer already submitted');
    }

    const response = await this.prisma.response.create({
      data: {
        roundId: round.id,
        playerId: player.id,
        text
      }
    });

    return response;
  }

  async submitVote(partyCode: string, socketId: string, accusedPlayerId: string) {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: {
        rounds: {
          where: { status: 'reveal' },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party || !party.rounds[0]) {
      throw new Error('No active reveal round found');
    }

    const voter = await this.prisma.player.findFirst({
      where: { socketId, partyId: party.id }
    });

    if (!voter) {
      throw new Error('Voter not found');
    }

    const round = party.rounds[0];


    // For "No Liar" votes, we'll use a special approach without creating a database player
    // We'll store the vote with isNoLiarVote = true and accusedPlayerId = null
    let actualAccusedPlayerId: string | null = accusedPlayerId;
    let isNoLiarVote = false;
    
    if (accusedPlayerId === 'NO_LIAR') {
      // For "No Liar" votes, we'll use the isNoLiarVote flag instead
      actualAccusedPlayerId = null;
      isNoLiarVote = true;
    }

    // Check if voter already voted - if so, update the existing vote instead of creating new one
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        roundId_voterId: {
          roundId: round.id,
          voterId: voter.id
        }
      }
    });

    let vote;
    if (existingVote) {
      // Update existing vote
      vote = await this.prisma.vote.update({
        where: {
          roundId_voterId: {
            roundId: round.id,
            voterId: voter.id
          }
        },
        data: {
          accusedPlayerId: actualAccusedPlayerId,
          isNoLiarVote: isNoLiarVote
        }
      });
    } else {
      // Create new vote
      vote = await this.prisma.vote.create({
        data: {
          roundId: round.id,
          voterId: voter.id,
          accusedPlayerId: actualAccusedPlayerId,
          isNoLiarVote: isNoLiarVote
        }
      });
    }

    // Return the vote with the original accusedPlayerId for client reference
    return {
      ...vote,
      accusedPlayerId: accusedPlayerId // Keep the original value for client
    };
  }

  async checkAllAnswersSubmitted(partyCode: string): Promise<boolean> {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: {
        players: { where: { isActive: true } },
        rounds: {
          where: { status: 'answer' },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party || !party.rounds[0]) {
      return false;
    }

    const responseCount = await this.prisma.response.count({
      where: { roundId: party.rounds[0].id }
    });

    return responseCount >= party.players.length;
  }

  async checkAllVotesSubmitted(partyCode: string): Promise<boolean> {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: {
        players: { where: { isActive: true } },
        rounds: {
          where: { status: 'reveal' },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party || !party.rounds[0]) {
      return false;
    }

    const voteCount = await this.prisma.vote.count({
      where: { roundId: party.rounds[0].id }
    });

    return voteCount >= party.players.length;
  }

  async advancePhase(partyCode: string, phase: string, hostSocketId: string) {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: { players: true }
    });

    if (!party) {
      throw new Error('Party not found');
    }

    const hostPlayer = party.players.find(p => p.socketId === hostSocketId);
    if (!hostPlayer || !hostPlayer.isHost) {
      throw new Error('Only host can advance phase');
    }

    const currentRound = await this.prisma.round.findFirst({
      where: { partyId: party.id },
      orderBy: { number: 'desc' }
    });

    if (!currentRound) {
      throw new Error('No active round found');
    }

    // Update round status
    const updatedRound = await this.prisma.round.update({
      where: { id: currentRound.id },
      data: { status: phase },
      include: {
        assignments: { include: { player: true } },
        responses: { include: { player: true } },
        votes: { include: { voter: true, accused: true } },
        prompt: true
      }
    });

    // If advancing to results phase, calculate scores
    if (phase === 'results') {
      await this.calculateRoundResults(updatedRound);
    }

    // If advancing to reveal phase, check if we're coming from sequential-reveal
    if (phase === 'reveal') {
      if (currentRound.status === 'sequential-reveal') {
        // Transition from sequential-reveal to reveal (normal transition)
        console.log(`Transitioning from sequential-reveal to reveal for party ${partyCode}`);
        // Update to reveal phase
        const updatedRound = await this.prisma.round.update({
          where: { id: currentRound.id },
          data: { status: 'reveal' },
          include: {
            assignments: { include: { player: true } },
            responses: { include: { player: true } },
            votes: { include: { voter: true, accused: true } },
            prompt: true
          }
        });
        
        const updatedParty = await this.getPartyState(party.code);
        return {
          round: updatedRound,
          party: updatedParty
        };
      } else {
        // First time transitioning to reveal, go to sequential-reveal first
        // Update to sequential-reveal phase instead
        const sequentialRevealRound = await this.prisma.round.update({
          where: { id: currentRound.id },
          data: { status: 'sequential-reveal' }
        });
        
        // Get the updated round with all includes
        const updatedSequentialRound = await this.prisma.round.findUnique({
          where: { id: currentRound.id },
          include: {
            assignments: { include: { player: true } },
            responses: { include: { player: true } },
            votes: { include: { voter: true, accused: true } },
            prompt: true
          }
        });
        
        // Add flag to indicate that the reveal sequence should auto-start
        (updatedSequentialRound as any).autoStartReveal = true;
        
        const updatedParty = await this.getPartyState(party.code);
        return {
          round: updatedSequentialRound,
          party: updatedParty
        };
      }
    }

    const updatedParty = await this.getPartyState(party.code);

    return {
      round: updatedRound,
      party: updatedParty
    };
  }

  private async calculateRoundResults(round: any) {
    const votes = await this.prisma.vote.findMany({
      where: { roundId: round.id },
      include: { accused: true }
    });

    // Get all active players to determine total count
    const allPlayers = await this.prisma.player.findMany({
      where: { partyId: round.partyId, isActive: true }
    });
    
    // In custom mode, exclude the prompt creator from scoring calculations
    const participatingPlayers = round.isCustomPrompt && round.promptCreatorId 
      ? allPlayers.filter(p => p.id !== round.promptCreatorId)
      : allPlayers;
    
    const N = participatingPlayers.length;
    const majorityThreshold = Math.floor(N / 2) + 1;

    // Count votes for each player (excluding NO_LIAR votes)
    const voteCounts: { [playerId: string]: number } = {};
    let noLiarVotes = 0;
    
    votes.forEach(vote => {
      // Check if this is a "No Liar" vote using the new field
      if (vote.isNoLiarVote) {
        noLiarVotes++;
      } else if (vote.accusedPlayerId) {
        voteCounts[vote.accusedPlayerId] = (voteCounts[vote.accusedPlayerId] || 0) + 1;
      }
    });

    // Find the option with the most votes
    const allVoteCounts = { ...voteCounts };
    if (noLiarVotes > 0) {
      allVoteCounts['NO_LIAR'] = noLiarVotes;
    }

    const maxVotes = Math.max(...Object.values(allVoteCounts));
    const winningOptions = Object.keys(allVoteCounts).filter(
      key => allVoteCounts[key] === maxVotes
    );

    // Determine if we have a majority
    const hasMajority = maxVotes >= majorityThreshold;
    const winner = hasMajority ? winningOptions[0] : null;

    // Calculate score changes based on new scoring logic
    const scoresDelta: { [playerId: string]: number } = {};

    // Check if this is a no-liar round (liarIndex = null)
    // For now, we'll assume all rounds have a liar, but this can be extended
    const hasLiar = round.liarPlayerId !== null;

    if (hasLiar) {
      // A) Round with a liar
      const liarVotes = voteCounts[round.liarPlayerId] || 0;
      
      if (liarVotes === 0) {
        // 👻 Perfect Lie: Liar gets 0 votes (regardless of what wins)
        scoresDelta[round.liarPlayerId] = 3;
      } else if (winner === round.liarPlayerId) {
        // ✅ Group Win: Majority vote liar
        const truthPlayers = await this.prisma.assignment.findMany({
          where: { roundId: round.id, role: 'truth' }
        });
        truthPlayers.forEach(assignment => {
          // In custom mode, don't give points to the prompt creator
          if (!round.isCustomPrompt || assignment.playerId !== round.promptCreatorId) {
            scoresDelta[assignment.playerId] = 1;
          }
        });
        // Liar gets 0
      } else {
        // 😈 Liar Escaped: Liar avoids majority detection (gets some votes but < majority, or no majority at all)
        scoresDelta[round.liarPlayerId] = 2;
      }
    } else {
      // No Liar round - scoring logic moved below after win type determination
    }

    // Update player scores
    for (const [playerId, scoreChange] of Object.entries(scoresDelta)) {
      await this.prisma.player.update({
        where: { id: playerId },
        data: { score: { increment: scoreChange } }
      });
    }

    // Create round summary - include ALL players, even those who didn't submit
    const responses = await this.prisma.response.findMany({
      where: { roundId: round.id },
      include: { player: true }
    });

    // Create answers array with all players
    const answers = allPlayers.map(player => {
      const response = responses.find(r => r.playerId === player.id);
      return {
        playerId: player.id,
        text: response?.text || '', // Empty string if no response
        isLiar: round.liarPlayerId ? player.id === round.liarPlayerId : false // Handle No Liar rounds
      };
    });

    // Determine if liar was caught for summary and calculate win type
    const liarCaught = hasLiar && winner === round.liarPlayerId;
    
    let winType = 'group_win'; // Default
    
    if (hasLiar) {
      // Regular round with liar
      const liarVotes = voteCounts[round.liarPlayerId] || 0;
      
      if (liarVotes === 0) {
        winType = 'perfect_lie';
      } else if (winner === round.liarPlayerId) {
        winType = 'group_win';
      } else {
        // Liar gets some votes but less than majority
        winType = 'liar_escaped';
      }
    } else {
      // No Liar round
      if (winner === 'NO_LIAR') {
        winType = 'group_win';
        // Give +1 points to all players who voted "No Liar" (excluding prompt creator in custom mode)
        votes.forEach(vote => {
          if (vote.isNoLiarVote) {
            // In custom mode, don't give points to the prompt creator
            if (!round.isCustomPrompt || vote.voterId !== round.promptCreatorId) {
              scoresDelta[vote.voterId] = 1;
            }
          }
        });
      } else {
        winType = 'missed_no_liar';
        // No points for anyone if no majority on "No Liar"
      }
    }

    await this.prisma.roundSummary.create({
      data: {
        roundId: round.id,
        liarCaught,
        winType,
        scoresDelta
      }
    });
  }

  async reconnectPlayer(partyCode: string, playerId: string, socketId: string) {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: { players: true }
    });

    if (!party) {
      throw new Error('Party not found');
    }

    const player = party.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Double-check that the player still exists in the database
    const playerExists = await this.prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!playerExists) {
      throw new Error('Player has been removed from this party');
    }

    const updatedPlayer = await this.prisma.player.update({
      where: { id: playerId },
      data: { socketId, isActive: true }
    });

    const updatedParty = await this.getPartyState(party.code);

    return {
      party: updatedParty,
      player: updatedPlayer
    };
  }

  async handleDisconnect(socketId: string) {
    // Find the player and their party before updating
    const player = await this.prisma.player.findFirst({
      where: { socketId },
      include: { 
        party: {
          include: {
            players: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (player) {
      const wasHost = player.isHost;
      const partyCode = player.party.code;
      
      // Simply mark the player as inactive - don't promote new host on disconnect
      await this.prisma.player.updateMany({
        where: { socketId },
        data: { isActive: false }
      });

      if (wasHost) {
        console.log(`Host ${player.nickname} disconnected from party ${partyCode} - keeping host status for reconnection`);
      } else {
        console.log(`Player ${player.nickname} disconnected (marked inactive) from party ${partyCode}`);
      }

      // Return the party code so the socket handler can broadcast the update
      return player.party.code;
    }
    
    console.log(`No player found with socketId ${socketId} - player may have been already removed`);
    return null;
  }

  async handleLeaveParty(playerId: string) {
    // Find the player and their party before removing
    const player = await this.prisma.player.findFirst({
      where: { id: playerId },
      include: { 
        party: {
          include: {
            players: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' } // First joined becomes new host
            }
          }
        }
      }
    });

    if (player) {
      const wasHost = player.isHost;
      const partyCode = player.party.code;
      
      console.log(`Player ${player.nickname} (Host: ${wasHost}) is leaving party ${partyCode} - will be completely removed`);
      
      // Use a transaction to ensure atomic removal and host promotion
      await this.prisma.$transaction(async (tx) => {
        console.log(`Deleting player ${player.nickname} (${player.id}) from party ${partyCode}`);
        
        // Check current players before deletion
        const playersBefore = await tx.player.findMany({
          where: { partyId: player.party.id }
        });
        console.log(`Players before deletion:`, playersBefore.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));
        
        // First, handle any rounds where this player is the liar
        // Delete rounds where this player is the liar since they're leaving
        const roundsToDelete = await tx.round.findMany({
          where: { liarPlayerId: player.id }
        });
        
        for (const round of roundsToDelete) {
          // Delete round summary first
          await tx.roundSummary.deleteMany({
            where: { roundId: round.id }
          });
          
          // Delete the round
          await tx.round.delete({
            where: { id: round.id }
          });
        }
        
        if (roundsToDelete.length > 0) {
          console.log(`Deleted ${roundsToDelete.length} rounds where ${player.nickname} was the liar`);
        }

        // Clear any responses/votes from this player in active rounds
        await tx.response.deleteMany({
          where: { playerId: player.id }
        });

        await tx.vote.deleteMany({
          where: { voterId: player.id }
        });

        await tx.vote.deleteMany({
          where: { accusedPlayerId: player.id }
        });

        // Remove the player completely from the party
        await tx.player.delete({
          where: { id: player.id }
        });
        console.log(`Successfully deleted player ${player.nickname} from database`);
        
        // Check players after deletion
        const playersAfter = await tx.player.findMany({
          where: { partyId: player.party.id }
        });
        console.log(`Players after deletion:`, playersAfter.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));

        // If the leaving player was the host, promote the next player
        if (wasHost) {
          // Ensure no other players are hosts before promoting
          await tx.player.updateMany({
            where: { 
              partyId: player.party.id,
              isHost: true
            },
            data: { isHost: false }
          });

          // Find remaining active players (excluding the one we just deleted)
          const remainingPlayers = await tx.player.findMany({
            where: { 
              partyId: player.party.id,
              isActive: true 
            },
            orderBy: { createdAt: 'asc' } // First joined becomes new host
          });

          if (remainingPlayers.length > 0) {
            // Promote the first remaining player to host
            const newHost = remainingPlayers[0];
            await tx.player.update({
              where: { id: newHost.id },
              data: { isHost: true }
            });

            // Update the party's hostId
            await tx.party.update({
              where: { id: player.party.id },
              data: { hostId: newHost.id }
            });

            console.log(`Host left party ${partyCode}. Promoted ${newHost.nickname} to new host.`);
          } else {
            // No remaining players, party should be cleaned up
            console.log(`Host left party ${partyCode} with no remaining players.`);
          }
        }
      });

      // Return the party code so the socket handler can broadcast the update
      return partyCode;
    }
    
    return null;
  }

  async kickPlayer(partyCode: string, playerIdToKick: string, hostSocketId: string) {
    try {
      // First, verify the host has permission to kick
      const hostPlayer = await this.prisma.player.findFirst({
        where: { socketId: hostSocketId },
        include: { party: true }
      });

      if (!hostPlayer) {
        return { success: false, message: 'Host not found' };
      }

      if (hostPlayer.party.code !== partyCode) {
        return { success: false, message: 'Host not in this party' };
      }

      if (!hostPlayer.isHost) {
        return { success: false, message: 'Only the host can remove players' };
      }

      // Find the player to kick
      const playerToKick = await this.prisma.player.findFirst({
        where: { 
          id: playerIdToKick,
          partyId: hostPlayer.partyId 
        }
      });

      if (!playerToKick) {
        return { success: false, message: 'Player not found in this party' };
      }

      // Note: We now allow kicking the host - a new host will be promoted

      // Use a transaction to ensure atomic removal
      await this.prisma.$transaction(async (tx) => {
        // First, clear all references to this player
        
        // Delete assignments for this player
        await tx.assignment.deleteMany({
          where: { playerId: playerIdToKick }
        });

        // Delete responses from this player
        await tx.response.deleteMany({
          where: { playerId: playerIdToKick }
        });

        // Delete votes by this player
        await tx.vote.deleteMany({
          where: { voterId: playerIdToKick }
        });

        // Delete votes accusing this player
        await tx.vote.deleteMany({
          where: { accusedPlayerId: playerIdToKick }
        });

        // Update rounds where this player is the liar (set to null or another player)
        const roundsWithThisLiar = await tx.round.findMany({
          where: { liarPlayerId: playerIdToKick }
        });

        // For rounds where this player is the liar, we need to handle this carefully
        // For now, let's just delete these rounds since the game should continue without them
        for (const round of roundsWithThisLiar) {
          // Delete round summary first
          await tx.roundSummary.deleteMany({
            where: { roundId: round.id }
          });
          
          // Delete the round
          await tx.round.delete({
            where: { id: round.id }
          });
        }

        // If the kicked player was the host, promote the next player
        if (playerToKick.isHost) {
          // Ensure no other players are hosts before promoting
          await tx.player.updateMany({
            where: { 
              partyId: hostPlayer.partyId,
              isHost: true,
              id: { not: playerIdToKick }
            },
            data: { isHost: false }
          });

          // Find remaining active players (excluding the one we're about to delete)
          const remainingPlayers = await tx.player.findMany({
            where: { 
              partyId: hostPlayer.partyId,
              isActive: true,
              id: { not: playerIdToKick } // Exclude the player being kicked
            },
            orderBy: { createdAt: 'asc' } // First joined becomes new host
          });

          if (remainingPlayers.length > 0) {
            // Promote the first remaining player to host
            const newHost = remainingPlayers[0];
            await tx.player.update({
              where: { id: newHost.id },
              data: { isHost: true }
            });

            // Update the party's hostId
            await tx.party.update({
              where: { id: hostPlayer.partyId },
              data: { hostId: newHost.id }
            });

            console.log(`Host kicked from party ${partyCode}. Promoted ${newHost.nickname} to new host.`);
          } else {
            // No remaining players, party should be cleaned up
            console.log(`Host kicked from party ${partyCode} with no remaining players.`);
          }
        }

        // Finally, remove the player from the party
        await tx.player.delete({
          where: { id: playerIdToKick }
        });
      });

      return { 
        success: true, 
        kickedPlayerSocketId: playerToKick.socketId 
      };

    } catch (error) {
      console.error('Error kicking player:', error);
      console.error('Error details:', {
        partyCode,
        playerIdToKick,
        hostSocketId,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
      return { success: false, message: `Failed to remove player: ${(error as Error).message}` };
    }
  }

  async getPartyState(partyCode: string) {
    // First, get just the party and players (lightweight query)
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: { players: true }
    });

    if (!party) {
      throw new Error(`Party with code ${partyCode} not found`);
    }

    // Ensure only one host exists in this party
    await this.ensureSingleHost(party.id);

    // Now get the complete state with rounds (only if needed)
    const updatedParty = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: {
        players: true,
        rounds: {
          include: { 
            summary: true,
            assignments: { include: { player: true } },
            responses: { include: { player: true } },
            votes: { include: { voter: true, accused: true } },
            prompt: true
          },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    })!;

    if (!updatedParty) {
      throw new Error('Party not found');
    }
    
    console.log(`getPartyState for ${partyCode} returning ${updatedParty.players.length} players:`, updatedParty.players.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));
    return updatedParty;
  }

  async returnPartyToLobby(partyCode: string) {
    try {
      console.log('Returning party to lobby:', partyCode);
      
      // First, get the party to find all its rounds
      const party = await this.prisma.party.findUnique({
        where: { code: partyCode },
        include: { rounds: true }
      });

      if (!party) {
        throw new Error('Party not found');
      }

      // Delete all rounds and related data to ensure fresh start
      if (party.rounds.length > 0) {
        console.log(`Deleting ${party.rounds.length} rounds for fresh start`);
        
        // Delete rounds (this will cascade to delete related data)
        await this.prisma.round.deleteMany({
          where: { partyId: party.id }
        });
      }

      // Update party status to lobby and return clean lobby state
      const updatedParty = await this.prisma.party.update({
        where: { code: partyCode },
        data: { 
          status: 'lobby',
          updatedAt: new Date()
        },
        include: {
          players: true,
          rounds: {
            include: { 
              summary: true,
              assignments: { include: { player: true } },
              responses: { include: { player: true } },
              votes: { include: { voter: true, accused: true } },
              prompt: true
            },
            orderBy: { number: 'desc' },
            take: 1
          }
        }
      });

      // Return a clean lobby state without rounds
      const cleanPartyState = {
        ...updatedParty,
        rounds: [] // Ensure no rounds in response
      };

      console.log('Party returned to lobby successfully with fresh start');
      return cleanPartyState;
    } catch (error) {
      console.error('Error returning party to lobby:', error);
      return null;
    }
  }

  private async getPartyStateById(partyId: string) {
    return await this.prisma.party.findUnique({
      where: { id: partyId },
      include: {
        players: true,
        rounds: {
          include: { 
            summary: true,
            assignments: { include: { player: true } },
            responses: { include: { player: true } },
            votes: { include: { voter: true, accused: true } },
            prompt: true
          },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });
  }

  // Helper method to determine prompt creator for custom mode
  private getPromptCreator(roundNumber: number, players: any[]): any {
    // Round 1: Host creates prompt
    // Round 2+: Rotate through players in join order
    const hostIndex = players.findIndex(p => p.isHost);
    const creatorIndex = (hostIndex + roundNumber - 1) % players.length;
    return players[creatorIndex];
  }

  // Helper method to create assignments
  private async createAssignments(roundId: string, assignments: any[]): Promise<any[]> {
    return Promise.all(
      assignments.map((assignment: any) =>
        this.prisma.assignment.create({
          data: {
            roundId,
            playerId: assignment.playerId,
            role: assignment.role,
            promptVariant: assignment.promptVariant,
          },
        })
      )
    );
  }

  // Helper method to create round result for classic mode
  private async createRoundResult(round: any, party: any, assignments: any[]): Promise<any> {
    const createdAssignments = await this.createAssignments(round.id, assignments);
    
    return {
      round,
      party: await this.getPartyState(party.code),
      assignments: createdAssignments
    };
  }

  // Handle custom prompt creation
  async createCustomPrompt(partyCode: string, playerId: string, textTrue: string, textDecoy: string) {
    const party = await this.prisma.party.findUnique({
      where: { code: partyCode },
      include: { 
        players: { where: { isActive: true } },
        rounds: { 
          where: { status: 'prompt-creation' },
          orderBy: { number: 'desc' },
          take: 1
        }
      }
    });

    if (!party) {
      throw new Error('Party not found');
    }

    const currentRound = party.rounds[0];
    if (!currentRound || currentRound.promptCreatorId !== playerId) {
      throw new Error('You are not the prompt creator for this round');
    }

    // Update the round with the custom prompt
    const updatedRound = await this.prisma.round.update({
      where: { id: currentRound.id },
      data: {
        customPromptTextTrue: textTrue,
        customPromptTextDecoy: textDecoy,
        status: 'answer' // Move to answer phase
      }
    });

    return {
      round: updatedRound,
      party: await this.getPartyState(partyCode)
    };
  }

  // Helper method to get player by socket ID
  async getPlayerBySocketId(socketId: string) {
    return await this.prisma.player.findFirst({
      where: { socketId, isActive: true }
    });
  }

  // Synchronized reveal methods
  async startSynchronizedReveal(partyCode: string, socketId: string) {
    try {
      // Verify the player is the host
      const player = await this.getPlayerBySocketId(socketId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can start the synchronized reveal');
      }

      // Get the current round and responses
      const round = await this.prisma.round.findFirst({
        where: {
          party: { code: partyCode },
          status: 'sequential-reveal'
        },
        include: {
          responses: {
            include: { player: true }
          },
          party: {
            include: { players: true }
          }
        }
      });

      if (!round) {
        throw new Error('No active sequential reveal round found');
      }

      // Get players with responses (excluding prompt creator and NO_LIAR)
      const playersWithResponses = round.party.players.filter(p => 
        p.id !== 'NO_LIAR' && 
        p.id !== round.promptCreatorId && 
        round.responses.find(r => r.playerId === p.id)
      );

      const startTime = Date.now() + 1000; // Start in 1 second
      
      return {
        startTime,
        responseCount: playersWithResponses.length,
        round,
        playersWithResponses
      };
    } catch (error) {
      console.error('Error starting synchronized reveal:', error);
      throw error;
    }
  }

  async advanceRevealSequence(partyCode: string, index: number, socketId: string) {
    try {
      // Verify the player is the host
      const player = await this.getPlayerBySocketId(socketId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can advance the reveal sequence');
      }

      const timestamp = Date.now();
      
      return {
        index,
        timestamp
      };
    } catch (error) {
      console.error('Error advancing reveal sequence:', error);
      throw error;
    }
  }

  async completeRevealSequence(partyCode: string, socketId: string) {
    try {
      // Verify the player is the host
      const player = await this.getPlayerBySocketId(socketId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can complete the reveal sequence');
      }

      const timestamp = Date.now();
      
      return {
        timestamp
      };
    } catch (error) {
      console.error('Error completing reveal sequence:', error);
      throw error;
    }
  }
}

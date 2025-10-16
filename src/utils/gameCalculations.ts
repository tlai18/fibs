// Game calculation utility functions

import { GAME_CONFIG, WIN_TYPES } from '../constants/game';
import type { WinType } from '../constants/game';

export interface VotingResult {
  playerId: string;
  voteCount: number;
  voters: string[];
}

export interface GameCalculationResult {
  winType: WinType;
  majorityThreshold: number;
  totalPlayers: number;
  liarVotes: number;
  noLiarVotes: number;
  votingResults: VotingResult[];
  scoresDelta: Record<string, number>;
}

/**
 * Calculate majority threshold
 */
export function calculateMajorityThreshold(totalPlayers: number): number {
  return Math.floor(totalPlayers / 2) + 1;
}

/**
 * Calculate voting results for a round
 */
export function calculateVotingResults(
  votes: Array<{ voterId: string; accusedPlayerId: string }>,
  players: Array<{ id: string; nickname: string }>
): VotingResult[] {
  const voteCounts: Record<string, { count: number; voters: string[] }> = {};
  
  // Initialize vote counts for all players and "NO_LIAR"
  players.forEach(player => {
    voteCounts[player.id] = { count: 0, voters: [] };
  });
  voteCounts['NO_LIAR'] = { count: 0, voters: [] };
  
  // Count votes
  votes.forEach(vote => {
    if (vote.isNoLiarVote) {
      voteCounts['NO_LIAR'].count++;
      voteCounts['NO_LIAR'].voters.push(vote.voterId);
    } else if (vote.accusedPlayerId && voteCounts[vote.accusedPlayerId]) {
      voteCounts[vote.accusedPlayerId].count++;
      voteCounts[vote.accusedPlayerId].voters.push(vote.voterId);
    }
  });
  
  // Convert to array and sort by vote count
  return Object.entries(voteCounts)
    .map(([playerId, data]) => ({
      playerId,
      voteCount: data.count,
      voters: data.voters
    }))
    .sort((a, b) => b.voteCount - a.voteCount);
}

/**
 * Calculate round results and scoring
 */
export function calculateRoundResults(
  votes: Array<{ voterId: string; accusedPlayerId: string }>,
  players: Array<{ id: string; nickname: string }>,
  liarPlayerId: string | null,
  isNoLiarRound: boolean = false
): GameCalculationResult {
  const totalPlayers = players.length;
  const majorityThreshold = calculateMajorityThreshold(totalPlayers);
  const votingResults = calculateVotingResults(votes, players);
  
  // Find vote counts for liar and "No Liar"
  const liarVotes = liarPlayerId ? 
    votingResults.find(r => r.playerId === liarPlayerId)?.voteCount || 0 : 0;
  const noLiarVotes = votingResults.find(r => r.playerId === 'NO_LIAR')?.voteCount || 0;
  
  let winType: WinType;
  const scoresDelta: Record<string, number> = {};
  
  // Initialize scores delta
  players.forEach(player => {
    scoresDelta[player.id] = 0;
  });
  
  if (isNoLiarRound) {
    // No Liar round logic
    if (noLiarVotes >= majorityThreshold) {
      winType = WIN_TYPES.GROUP_WIN;
      // Give points to those who voted "No Liar"
      const noLiarVoters = votingResults.find(r => r.playerId === 'NO_LIAR')?.voters || [];
      noLiarVoters.forEach(voterId => {
        scoresDelta[voterId] = 1;
      });
    } else {
      winType = WIN_TYPES.MISSED_NO_LIAR;
      // No points for anyone
    }
  } else {
    // Regular round with liar
    if (liarVotes >= majorityThreshold) {
      winType = WIN_TYPES.GROUP_WIN;
      // Give points to those who voted for the liar
      const liarVoters = votingResults.find(r => r.playerId === liarPlayerId)?.voters || [];
      liarVoters.forEach(voterId => {
        scoresDelta[voterId] = 1;
      });
    } else if (noLiarVotes >= majorityThreshold) {
      winType = WIN_TYPES.PERFECT_LIE;
      // Give points to the liar for perfect deception
      if (liarPlayerId) {
        scoresDelta[liarPlayerId] = 3;
      }
    } else {
      // No majority OR liar gets some votes but less than majority
      // Both scenarios result in Liar Escaped (liar wins)
      winType = WIN_TYPES.LIAR_ESCAPED;
      // Give points to the liar
      if (liarPlayerId) {
        scoresDelta[liarPlayerId] = 2;
      }
    }
  }
  
  return {
    winType,
    majorityThreshold,
    totalPlayers,
    liarVotes,
    noLiarVotes,
    votingResults,
    scoresDelta
  };
}

/**
 * Check if a round should be a no-liar round (10% chance)
 */
export function shouldBeNoLiarRound(): boolean {
  return Math.random() < GAME_CONFIG.NO_LIAR_CHANCE;
}


/**
 * Generate random roles for players
 */
export function assignRoles(playerIds: string[]): {
  liarPlayerId: string | null;
  isNoLiarRound: boolean;
} {
  const isNoLiarRound = shouldBeNoLiarRound();
  
  if (isNoLiarRound) {
    return { liarPlayerId: null, isNoLiarRound: true };
  }
  
  const randomIndex = Math.floor(Math.random() * playerIds.length);
  return { liarPlayerId: playerIds[randomIndex], isNoLiarRound: false };
}

// Game state utility functions

import { GAME_PHASES } from '../constants/game';
import type { GamePhase, WinType } from '../constants/game';

export interface GameState {
  id: string;
  code: string;
  status: string;
  players: Player[];
  rounds: Round[];
  hostId: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isActive: boolean;
  score: number;
}

export interface Round {
  id: string;
  number: number;
  status: GamePhase;
  liarPlayerId: string | null;
  responses: Response[];
  votes: Vote[];
  summary?: RoundSummary;
}

export interface Response {
  id: string;
  playerId: string;
  text: string;
}

export interface Vote {
  id: string;
  voterId: string;
  accusedPlayerId: string;
  createdAt: string;
}

export interface RoundSummary {
  id: string;
  winType: WinType;
  scoresDelta: Record<string, number>;
  winner: string | null;
}

/**
 * Get the current game phase
 */
export function getCurrentPhase(gameState: GameState | null): GamePhase {
  if (!gameState) return GAME_PHASES.LOBBY;
  
  const currentRound = gameState.rounds?.[0];
  if (!currentRound) {
    return GAME_PHASES.LOBBY;
  }
  
  return currentRound.status as GamePhase;
}

/**
 * Get the current round
 */
export function getCurrentRound(gameState: GameState | null): Round | null {
  if (!gameState || !gameState.rounds || gameState.rounds.length === 0) {
    return null;
  }
  
  return gameState.rounds[0];
}

/**
 * Check if it's a no-liar round
 */
export function isNoLiarRound(round: Round | null): boolean {
  return round?.liarPlayerId === null;
}

/**
 * Get the liar player
 */
export function getLiarPlayer(gameState: GameState | null, round: Round | null): Player | null {
  if (!gameState || !round || !round.liarPlayerId) {
    return null;
  }
  
  return gameState.players.find(p => p.id === round.liarPlayerId) || null;
}

/**
 * Get active players (excluding placeholder players)
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter(p => p.isActive && p.id !== 'NO_LIAR');
}

/**
 * Get player by ID
 */
export function getPlayerById(players: Player[], playerId: string): Player | null {
  return players.find(p => p.id === playerId) || null;
}

/**
 * Check if all players have submitted responses
 */
export function allPlayersAnswered(round: Round | null, activePlayers: Player[]): boolean {
  if (!round || !round.responses) return false;
  
  const activePlayerIds = activePlayers.map(p => p.id);
  const responsePlayerIds = round.responses.map(r => r.playerId);
  
  return activePlayerIds.every(id => responsePlayerIds.includes(id));
}

/**
 * Check if all players have voted
 */
export function allPlayersVoted(round: Round | null, activePlayers: Player[]): boolean {
  if (!round || !round.votes) return false;
  
  const activePlayerIds = activePlayers.map(p => p.id);
  const votePlayerIds = round.votes.map(v => v.voterId);
  
  return activePlayerIds.every(id => votePlayerIds.includes(id));
}

/**
 * Get voting progress
 */
export function getVotingProgress(round: Round | null, activePlayers: Player[]): {
  voted: number;
  total: number;
  percentage: number;
} {
  if (!round || !round.votes) {
    return { voted: 0, total: activePlayers.length, percentage: 0 };
  }
  
  const activePlayerIds = activePlayers.map(p => p.id);
  const votedCount = round.votes.filter(v => activePlayerIds.includes(v.voterId)).length;
  const total = activePlayers.length;
  const percentage = total > 0 ? Math.round((votedCount / total) * 100) : 0;
  
  return { voted: votedCount, total, percentage };
}

/**
 * Get answer submission progress
 */
export function getAnswerProgress(round: Round | null, activePlayers: Player[]): {
  submitted: number;
  total: number;
  percentage: number;
} {
  if (!round || !round.responses) {
    return { submitted: 0, total: activePlayers.length, percentage: 0 };
  }
  
  const activePlayerIds = activePlayers.map(p => p.id);
  const submittedCount = round.responses.filter(r => activePlayerIds.includes(r.playerId)).length;
  const total = activePlayers.length;
  const percentage = total > 0 ? Math.round((submittedCount / total) * 100) : 0;
  
  return { submitted: submittedCount, total, percentage };
}

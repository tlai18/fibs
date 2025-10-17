// Centralized type definitions

// Import and re-export game constants types
import type { GamePhase, PlayerRole, PromptVariant, WinType } from '../constants/game';
export type { GamePhase, PlayerRole, PromptVariant, WinType };

// Re-export UI constants types
export type { ButtonSize, ButtonVariant } from '../constants/ui';

// Game state types
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
  socketId?: string;
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
  submittedAt: string;
}

export interface Vote {
  id: string;
  voterId: string;
  accusedPlayerId: string | null;
  isNoLiarVote: boolean;
  createdAt: string;
}

export interface RoundSummary {
  id: string;
  winType: WinType;
  scoresDelta: Record<string, number>;
  winner: string | null;
}

// Socket event types
export interface SocketEvents {
  // Party events
  'party:create': { nickname: string; avatar: string };
  'party:created': { party: GameState; player: Player };
  'party:join': { code: string; nickname: string; avatar: string };
  'party:joined': { party: GameState; player: Player };
  'party:state': GameState;
  'party:reconnect': { partyCode: string; playerId: string };
  'party:reconnected': { party: GameState; player: Player };
  'party:leave': { partyCode: string; playerId: string };
  'party:left': { success: boolean };
  'party:kick-player': { partyCode: string; playerIdToKick: string };
  'player:kicked': { message: string };
  'player:kick-success': { success: boolean; message: string };

  // Game events
  'game:start': { partyCode: string };
  'game:next-phase': { partyCode: string; phase: GamePhase };
  'round:new': { round: Round; party: GameState; assignments: Assignment[] };
  'phase:changed': { round: Round; party: GameState };

  // Player actions
  'prompt:get-true': { roundId: string };
  'prompt:true-received': { textTrue: string; textDecoy: string };
  'answer:submit': { partyCode: string; text: string };
  'answer:submitted': Response;
  'vote:submit': { partyCode: string; accusedPlayerId: string };
  'vote:submitted': Vote;

  // Status updates
  'all:answered': { partyCode: string };
  'all:voted': { partyCode: string };
  'player:reconnected': Player;
  'game:return-to-lobby': { partyCode: string };
  'game:returned-to-lobby': { message: string };
}

// Assignment types
export interface Assignment {
  playerId: string;
  role: PlayerRole;
  promptText: string;
}

// Component prop types
export interface GameProviderProps {
  children: React.ReactNode;
  socket: unknown;
  gameState: GameState | null;
  player: Player | null;
}

export interface GameContextType {
  socket: unknown;
  gameState: GameState | null;
  player: Player | null;
  isHost: boolean;
}

// Form types
export interface PartyFormData {
  nickname: string;
  partyCode?: string;
  avatar: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Animation types
export interface AnimationConfig {
  delay?: number;
  duration?: number;
  easing?: string;
}

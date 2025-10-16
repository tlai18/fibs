export interface GameState {
  party: Party;
  currentRound?: Round;
  phase: GamePhase;
}

export interface Party {
  id: string;
  code: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  settings: Record<string, any>;
  usedPromptIds: number[];
  createdAt: Date;
  players: Player[];
  rounds?: Round[];
}

export interface Player {
  id: string;
  partyId: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isActive: boolean;
  score: number;
  socketId?: string;
  createdAt: Date;
}

export interface Round {
  id: string;
  partyId: string;
  number: number;
  liarPlayerId: string | null; // Made nullable for No Liar rounds
  stealth: boolean;
  status: GamePhase;
  startedAt: Date;
  endedAt?: Date;
  assignments?: Assignment[];
  responses?: Response[];
  votes?: Vote[];
  prompt?: Prompt;
  summary?: RoundSummary;
}

export interface Assignment {
  id: string;
  roundId: string;
  playerId: string;
  role: 'liar' | 'truth';
  promptVariant: 'true' | 'decoy';
  player?: Player;
}

export interface Response {
  id: string;
  roundId: string;
  playerId: string;
  text: string;
  submittedAt: Date;
  player?: Player;
}

export interface Vote {
  id: string;
  roundId: string;
  voterId: string;
  accusedPlayerId: string;
  submittedAt: Date;
  voter?: Player;
  accused?: Player;
}

export interface RoundSummary {
  id: string;
  roundId: string;
  liarCaught: boolean;
  scoresDelta: Record<string, number>;
  answers: Array<{
    playerId: string;
    text: string;
    isLiar: boolean;
  }>;
  votes: Array<{
    voterId: string;
    accusedPlayerId: string;
  }>;
  createdAt: Date;
}

export interface Prompt {
  id: string;
  category: string;
  textTrue: string;
  textDecoy: string;
  difficulty: number;
  enabled: boolean;
}

export type GamePhase = 'lobby' | 'answer' | 'reveal' | 'results';

export interface SocketEvents {
  // Party events
  'party:create': { nickname: string; avatar: string };
  'party:created': { party: Party; player: Player };
  'party:join': { code: string; nickname: string; avatar: string };
  'party:joined': { party: Party; player: Player };
  'party:state': Party;
  'party:reconnect': { partyCode: string; playerId: string };
  'party:reconnected': { party: Party; player: Player };
  'party:leave': { partyCode: string; playerId: string };
  'party:left': { success: boolean };
  'party:kick-player': { partyCode: string; playerIdToKick: string };
  'player:kicked': { message: string };
  'player:kick-success': { success: boolean; message: string };

  // Game events
  'game:start': { partyCode: string };
  'game:next-phase': { partyCode: string; phase: GamePhase };
  'round:new': { round: Round; party: Party; assignments: Assignment[] };
  'phase:changed': { round: Round; party: Party };

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
  'game:returned-to-lobby': { message: string };

  // Error handling
  'error': { message: string };
}

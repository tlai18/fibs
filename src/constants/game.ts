// Game-related constants

export const GAME_PHASES = {
  LOBBY: 'lobby',
  ANSWER: 'answer',
  REVEAL: 'reveal',
  RESULTS: 'results'
} as const;

export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];

export const PLAYER_ROLES = {
  LIAR: 'liar',
  TRUTH: 'truth'
} as const;

export type PlayerRole = typeof PLAYER_ROLES[keyof typeof PLAYER_ROLES];

export const PROMPT_VARIANTS = {
  TRUE: 'true',
  DECOY: 'decoy'
} as const;

export type PromptVariant = typeof PROMPT_VARIANTS[keyof typeof PROMPT_VARIANTS];

export const WIN_TYPES = {
  GROUP_WIN: 'group_win',
  PERFECT_LIE: 'perfect_lie',
  LIAR_ESCAPED: 'liar_escaped',
  MISSED_NO_LIAR: 'missed_no_liar'
} as const;

export type WinType = typeof WIN_TYPES[keyof typeof WIN_TYPES];

export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  RECOMMENDED_PLAYERS: 3,
  MAX_PLAYERS: 8,
  NO_LIAR_CHANCE: 0.1, // 10% chance
  RECONNECTION_TIMEOUT: 10000, // 10 seconds
  NAVIGATION_DELAY: 100 // 100ms
} as const;

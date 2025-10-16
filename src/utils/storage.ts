// Storage utility functions for managing localStorage and sessionStorage

export const STORAGE_KEYS = {
  PARTY_CODE: 'fibs-party-code',
  PLAYER_ID: 'fibs-player-id',
  NICKNAME: 'fibs-nickname',
  AVATAR: 'fibs-avatar',
  LAST_DISCONNECT: 'fibs-last-disconnect',
  IN_GAME: 'fibs-in-game'
} as const;

/**
 * Clear all party-related data from storage
 */
export function clearPartyData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.PARTY_CODE);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
  localStorage.removeItem(STORAGE_KEYS.NICKNAME);
  localStorage.removeItem(STORAGE_KEYS.AVATAR);
  localStorage.removeItem(STORAGE_KEYS.LAST_DISCONNECT);
  sessionStorage.removeItem(STORAGE_KEYS.IN_GAME);
}

/**
 * Clear only the session data (keep persistent data for reconnection)
 */
export function clearSessionData(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem(STORAGE_KEYS.IN_GAME);
  localStorage.removeItem(STORAGE_KEYS.LAST_DISCONNECT);
}

/**
 * Check if user is currently in an active game session
 */
export function isInGameSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.IN_GAME) === 'true';
}

/**
 * Get stored party code
 */
export function getStoredPartyCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.PARTY_CODE);
}

/**
 * Get stored player ID
 */
export function getStoredPlayerId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
}

/**
 * Get stored nickname
 */
export function getStoredNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.NICKNAME);
}

/**
 * Get stored avatar
 */
export function getStoredAvatar(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AVATAR);
}

/**
 * Store party context for reconnection
 */
export function storePartyContext(partyCode: string, playerId: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.PARTY_CODE, partyCode);
  localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
  sessionStorage.setItem(STORAGE_KEYS.IN_GAME, 'true');
}

/**
 * Store user preferences
 */
export function storeUserPreferences(nickname: string, avatar: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
  localStorage.setItem(STORAGE_KEYS.AVATAR, avatar);
}

/**
 * Check if user has existing party context
 */
export function hasExistingPartyContext(): boolean {
  if (typeof window === 'undefined') return false;
  
  const partyCode = getStoredPartyCode();
  const playerId = getStoredPlayerId();
  const inGameSession = isInGameSession();
  
  return !!(partyCode && playerId && inGameSession);
}

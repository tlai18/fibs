// Navigation utility functions

/**
 * Navigate to home page and clear party data
 */
export function navigateToHome(): void {
  if (typeof window === 'undefined') return;
  
  // Use setTimeout to ensure any pending operations complete
  setTimeout(() => {
    window.location.href = '/';
  }, 100);
}

/**
 * Navigate to game page with specific action
 */
export function navigateToGame(action: 'create' | 'join', code?: string): void {
  if (typeof window === 'undefined') return;
  
  const url = code ? `/game?action=${action}&code=${code}` : `/game?action=${action}`;
  window.location.href = url;
}

/**
 * Navigate to game page for reconnection
 */
export function navigateToGameForReconnection(): void {
  if (typeof window === 'undefined') return;
  
  window.location.href = '/game';
}

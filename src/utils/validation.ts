// Validation utility functions

/**
 * Validate nickname input
 */
export function validateNickname(nickname: string): { isValid: boolean; error?: string } {
  if (!nickname.trim()) {
    return { isValid: false, error: 'Nickname is required' };
  }
  
  if (nickname.trim().length < 2) {
    return { isValid: false, error: 'Nickname must be at least 2 characters' };
  }
  
  if (nickname.trim().length > 20) {
    return { isValid: false, error: 'Nickname must be less than 20 characters' };
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(nickname.trim())) {
    return { isValid: false, error: 'Nickname contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate party code input
 */
export function validatePartyCode(partyCode: string): { isValid: boolean; error?: string } {
  if (!partyCode.trim()) {
    return { isValid: false, error: 'Party code is required' };
  }
  
  if (partyCode.trim().length !== 4) {
    return { isValid: false, error: 'Party code must be 4 characters' };
  }
  
  // Check for invalid characters (only alphanumeric)
  const validChars = /^[A-Z0-9]+$/i;
  if (!validChars.test(partyCode.trim())) {
    return { isValid: false, error: 'Party code can only contain letters and numbers' };
  }
  
  return { isValid: true };
}

/**
 * Check if user can perform action (not already in a party)
 */
export function canPerformAction(): { canProceed: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { canProceed: true };
  }
  
  // Import storage functions dynamically to avoid circular dependencies
  const isInGameSession = () => sessionStorage.getItem('fibs-in-game') === 'true';
  const getStoredPartyCode = () => localStorage.getItem('fibs-party-code');
  
  const inGameSession = isInGameSession();
  const storedPartyCode = getStoredPartyCode();
  
  if (inGameSession && storedPartyCode) {
    return { 
      canProceed: false, 
      error: `You are already in party ${storedPartyCode}. Please leave the current party first or refresh the page.` 
    };
  }
  
  return { canProceed: true };
}

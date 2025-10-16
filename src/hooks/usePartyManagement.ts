// Custom hook for party management operations

import { useState, useCallback } from 'react';
import { 
  clearPartyData, 
  storePartyContext, 
  storeUserPreferences, 
  hasExistingPartyContext
} from '../utils/storage';
import { navigateToHome, navigateToGame, navigateToGameForReconnection } from '../utils/navigation';
import { validateNickname, validatePartyCode, canPerformAction } from '../utils/validation';
import { createSocket } from '../utils/socket';

export interface UsePartyManagementReturn {
  // State
  isCreating: boolean;
  isJoining: boolean;
  error: string;
  
  // Actions
  createParty: (nickname: string, avatar: string) => Promise<void>;
  joinParty: (nickname: string, partyCode: string, avatar: string) => Promise<void>;
  leaveParty: () => void;
  reconnectToParty: () => void;
  clearPartyContext: () => void;
  setError: (error: string) => void;
  
  // Utilities
  canCreateParty: () => { canProceed: boolean; error?: string };
  canJoinParty: () => { canProceed: boolean; error?: string };
  hasActiveParty: boolean;
}

export function usePartyManagement(): UsePartyManagementReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const hasActiveParty = hasExistingPartyContext();

  const createParty = useCallback(async (nickname: string, avatar: string) => {
    // Validation
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      setError(nicknameValidation.error!);
      return;
    }

    const actionValidation = canPerformAction();
    if (!actionValidation.canProceed) {
      setError(actionValidation.error!);
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Clear existing context and store preferences
      clearPartyData();
      storeUserPreferences(nickname.trim(), avatar);
      
      // Navigate to game page for party creation
      navigateToGame('create');
    } catch {
      setError('Failed to create party. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, []);

  const joinParty = useCallback(async (nickname: string, partyCode: string, avatar: string) => {
    // Validation
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      setError(nicknameValidation.error!);
      return;
    }

    const partyCodeValidation = validatePartyCode(partyCode);
    if (!partyCodeValidation.isValid) {
      setError(partyCodeValidation.error!);
      return;
    }

    const actionValidation = canPerformAction();
    if (!actionValidation.canProceed) {
      setError(actionValidation.error!);
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Store user preferences
      storeUserPreferences(nickname.trim(), avatar);
      
      // Create socket connection and join party
      const socket = createSocket();
      
      socket.on('connect', () => {
        socket.emit('party:join', {
          code: partyCode.toUpperCase(),
          nickname: nickname.trim(),
          avatar
        });
      });

      socket.on('party:joined', (data) => {
        storePartyContext(data.party.code, data.player.id);
        navigateToGameForReconnection();
      });

      socket.on('connect_error', () => {
        setError('Failed to connect to server. Please try again.');
        setIsJoining(false);
      });

      socket.on('error', (data) => {
        setError(data.message);
        setIsJoining(false);
        socket.close();
      });
    } catch {
      setError('Failed to join party. Please try again.');
      setIsJoining(false);
    }
  }, []);

  const leaveParty = useCallback(() => {
    clearPartyData();
    navigateToHome();
  }, []);

  const reconnectToParty = useCallback(() => {
    navigateToGameForReconnection();
  }, []);

  const clearPartyContext = useCallback(() => {
    clearPartyData();
    setError('');
  }, []);

  const canCreateParty = useCallback(() => {
    return canPerformAction();
  }, []);

  const canJoinParty = useCallback(() => {
    return canPerformAction();
  }, []);

  return {
    // State
    isCreating,
    isJoining,
    error,
    
    // Actions
    createParty,
    joinParty,
    leaveParty,
    reconnectToParty,
    clearPartyContext,
    setError,
    
    // Utilities
    canCreateParty,
    canJoinParty,
    hasActiveParty
  };
}

// Custom hook for managing socket events

import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { clearPartyData, clearSessionData } from '../utils/storage';
import { navigateToHome } from '../utils/navigation';

export interface UseSocketEventsConfig {
  onPartyStateUpdate?: (data: unknown) => void;
  onPlayerKicked?: (data: { message: string }) => void;
  onPartyLeft?: (data: { success: boolean }) => void;
  onGameReturnedToLobby?: (data: { message: string }) => void;
  onError?: (data: { message: string }) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export function useSocketEvents(socket: Socket | null, config: UseSocketEventsConfig = {}) {
  const {
    onPartyStateUpdate,
    onPlayerKicked,
    onPartyLeft,
    onGameReturnedToLobby,
    onError,
    onDisconnect,
    onReconnect
  } = config;

  const handlePlayerKicked = useCallback(() => {
    clearPartyData();
    navigateToHome();
    onPlayerKicked?.({ message: 'You have been kicked from the party' });
  }, [onPlayerKicked]);

  const handlePartyLeft = useCallback((data: { success: boolean }) => {
    if (data.success) {
      clearPartyData();
      navigateToHome();
    }
    onPartyLeft?.(data);
  }, [onPartyLeft]);

  const handleGameReturnedToLobby = useCallback((data: { message: string }) => {
    // The party:state event will update the UI to show lobby
    onGameReturnedToLobby?.(data);
  }, [onGameReturnedToLobby]);

  const handleDisconnect = useCallback(() => {
    // Mark disconnect time and clear session
    if (typeof window !== 'undefined') {
      localStorage.setItem('fibs-last-disconnect', Date.now().toString());
      clearSessionData();
    }
    onDisconnect?.();
  }, [onDisconnect]);

  const handleReconnect = useCallback(() => {
    // Auto-reconnect if we have stored context
    if (typeof window !== 'undefined') {
      const storedPartyCode = localStorage.getItem('fibs-party-code');
      const storedPlayerId = localStorage.getItem('fibs-player-id');
      
      if (storedPartyCode && storedPlayerId && socket) {
        socket.emit('party:reconnect', {
          partyCode: storedPartyCode,
          playerId: storedPlayerId
        });
      }
    }
    onReconnect?.();
  }, [socket, onReconnect]);

  useEffect(() => {
    if (!socket) return;

    // Register event listeners
    if (onPartyStateUpdate) {
      socket.on('party:state', onPartyStateUpdate);
    }
    
    socket.on('player:kicked', handlePlayerKicked);
    socket.on('party:left', handlePartyLeft);
    socket.on('game:returned-to-lobby', handleGameReturnedToLobby);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    if (onError) {
      socket.on('error', onError);
    }

    // Cleanup function
    return () => {
      if (onPartyStateUpdate) {
        socket.off('party:state', onPartyStateUpdate);
      }
      
      socket.off('player:kicked', handlePlayerKicked);
      socket.off('party:left', handlePartyLeft);
      socket.off('game:returned-to-lobby', handleGameReturnedToLobby);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      
      if (onError) {
        socket.off('error', onError);
      }
    };
  }, [
    socket,
    onPartyStateUpdate,
    handlePlayerKicked,
    handlePartyLeft,
    handleGameReturnedToLobby,
    handleDisconnect,
    handleReconnect,
    onError
  ]);
}

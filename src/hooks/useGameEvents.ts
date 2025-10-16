import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

export function useGameEvents(socket: Socket) {
  useEffect(() => {
    const cleanupAndRedirect = () => {
      localStorage.removeItem('fibs-party-code');
      localStorage.removeItem('fibs-player-id');
      localStorage.removeItem('fibs-last-disconnect');
      sessionStorage.removeItem('fibs-in-game');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    };

    const handlePlayerKicked = () => {
      cleanupAndRedirect();
    };

    const handlePartyLeft = (data: { success: boolean }) => {
      if (data.success) {
        cleanupAndRedirect();
      }
    };

    const handlePartyState = () => {
      // Party state update handled by parent component
    };

    const handleReturnedToLobby = () => {
      // The party:state event will update the UI to show lobby
      // No need to redirect since we're staying in the same party
    };

    socket.on('player:kicked', handlePlayerKicked);
    socket.on('party:left', handlePartyLeft);
    socket.on('party:state', handlePartyState);
    socket.on('game:returned-to-lobby', handleReturnedToLobby);

    return () => {
      socket.off('player:kicked', handlePlayerKicked);
      socket.off('party:left', handlePartyLeft);
      socket.off('party:state', handlePartyState);
      socket.off('game:returned-to-lobby', handleReturnedToLobby);
    };
  }, [socket]);
}

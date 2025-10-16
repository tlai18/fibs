'use client';

import { useGame } from '../GameProvider';

export function HostReturnToLobbyButton() {
  const { socket, gameState, isHost } = useGame();

  if (!isHost) return null;

  const handleReturnToLobby = () => {
    if (confirm('Return everyone to the party lobby? This will end the current round.')) {
      
      // Listen for error response
      const handleError = (error: any) => {
        console.error('Error returning to lobby:', error);
        alert('Failed to return to lobby: ' + error.message);
        socket.off('error', handleError);
      };
      
      socket.on('error', handleError);
      socket.emit('game:return-to-lobby', { partyCode: gameState.code });
      
      // Clean up error listener after 5 seconds
      setTimeout(() => {
        socket.off('error', handleError);
      }, 5000);
    }
  };

  return (
    <button
      onClick={handleReturnToLobby}
      className="fixed top-4 right-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-white/70 hover:text-white/90 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm z-50"
      title="Return everyone to lobby"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    </button>
  );
}

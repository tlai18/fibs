'use client';

import { useGame } from './GameProvider';
import { AnimeAvatar } from './avatars/AnimeAvatar';

interface PlayerListProps {
  showKickButtons?: boolean;
  className?: string;
}

export function PlayerList({ showKickButtons = false, className = '' }: PlayerListProps) {
  const { socket, gameState, player, isHost } = useGame();

  const handleKickPlayer = (playerId: string) => {
    if (!isHost) return;
    
    // Emit kick player event to server
    socket.emit('party:kick-player', { 
      partyCode: gameState.code, 
      playerIdToKick: playerId 
    });
  };

  const handleLeaveParty = () => {
    // Emit leave party event to server
    socket.emit('party:leave', { 
      partyCode: gameState.code, 
      playerId: player.id 
    });
  };

  return (
    <div className={`grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {gameState.players
        .filter((p: any) => p.id !== 'NO_LIAR') // Filter out the NO_LIAR placeholder
        .map((p: any) => (
        <div
          key={p.id}
          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
            p.isHost
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}
        >
          {/* Online Status Indicator */}
          <div className="absolute top-2 right-2">
            <div className={`w-3 h-3 rounded-full ${p.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>

          {/* Avatar and Name */}
          <div className="flex flex-col items-center gap-3">
            <AnimeAvatar type={p.avatar || 'cat'} size="lg" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-medium text-sm">{p.nickname}</span>
              {p.isHost && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  Host
                </span>
              )}
            </div>
          </div>

          {/* Kick Button */}
          {showKickButtons && isHost && !p.isHost && (
            <button
              onClick={() => handleKickPlayer(p.id)}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 backdrop-blur-sm border border-white/20 hover:border-white/40"
              title="Kick Player"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
        </div>
      ))}
    </div>
  );
}

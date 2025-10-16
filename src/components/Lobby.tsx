'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { PlayerList } from './PlayerList';
import { HowToPlay } from './HowToPlay';
import { PartyCodeDisplay } from './ui/PartyCodeDisplay';
import { clearPartyData } from '../utils/storage';
import { navigateToHome } from '../utils/navigation';

export function Lobby() {
  const { socket, gameState, player, isHost } = useGame();
  const [isStarting, setIsStarting] = useState(false);

  // Listen for party:left response from server
  useEffect(() => {
    const handlePartyLeft = (data: { success: boolean }) => {
      if (data.success) {
        clearPartyData();
        navigateToHome();
      }
    };

    const handlePlayerKicked = (data: { message: string }) => {
      clearPartyData();
      navigateToHome();
    };

    const handleKickSuccess = (data: { success: boolean; message: string }) => {
      if (data.success) {
        // The party:state event will update the player list automatically
      }
    };

    socket.on('party:left', handlePartyLeft);
    socket.on('player:kicked', handlePlayerKicked);
    socket.on('player:kick-success', handleKickSuccess);
    
    return () => {
      socket.off('party:left', handlePartyLeft);
      socket.off('player:kicked', handlePlayerKicked);
      socket.off('player:kick-success', handleKickSuccess);
    };
  }, [socket]);

  const handleStartGame = async () => {
    if (!isHost) return;
    
    setIsStarting(true);
    socket.emit('game:start', { partyCode: gameState.code });
    
    // Set a timeout to reset the loading state if no response
    const timeout = setTimeout(() => {
      console.error('Start game request timed out');
      setIsStarting(false);
    }, 10000); // 10 second timeout
    
    // Listen for success or error
    const handleRoundNew = () => {
      clearTimeout(timeout);
      setIsStarting(false);
      socket.off('round:new', handleRoundNew);
      socket.off('error', handleError);
    };
    
    const handleError = (error: any) => {
      clearTimeout(timeout);
      console.error('Start game error:', error);
      setIsStarting(false);
      socket.off('round:new', handleRoundNew);
      socket.off('error', handleError);
    };
    
    socket.on('round:new', handleRoundNew);
    socket.on('error', handleError);
  };


  const copyEntireLink = () => {
    if (typeof window !== 'undefined') {
      const joinUrl = `${window.location.origin}/game?action=join&code=${gameState.code}`;
      navigator.clipboard.writeText(joinUrl);
      // TODO: Show toast notification
    }
  };

  const handleLeaveParty = () => {
    // Emit leave party event to server
    socket.emit('party:leave', { 
      partyCode: gameState.code, 
      playerId: player.id 
    });
  };

  // Don't render until gameState is available to prevent hydration mismatch
  if (!gameState) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
        <div className="text-white text-xl">Loading lobby...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 relative z-10 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-white/20 px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">Party Lobby</h1>
            <PartyCodeDisplay partyCode={gameState.code} />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={copyEntireLink}
              className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-200 px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 border border-blue-400/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </button>
            <button
              onClick={handleLeaveParty}
              className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-200 px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 border border-red-400/30 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave Party
            </button>
          </div>

          {/* Players Section */}
          <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Players ({gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length})
            </h2>
            <PlayerList showKickButtons={true} />
          </div>

          {/* Game Rules Section */}
          <HowToPlay />
        </div>

        {/* Host Controls */}
        <div className="mt-8">
          {isHost ? (
            <div className="text-center">
              <button
                onClick={handleStartGame}
                disabled={gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length < 2 || isStarting}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isStarting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Starting Game...
                  </span>
                ) : (
                  `Start Game (${gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length} players)`
                )}
              </button>
              {gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length < 2 && (
                <p className="text-red-300 text-sm mt-3 flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  Need at least 2 players to start
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-400/20">
                <div className="text-blue-200 text-lg flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  Waiting for host to start the game...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

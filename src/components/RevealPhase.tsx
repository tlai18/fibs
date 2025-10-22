'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { PlayerList } from './PlayerList';
import { AnimeAvatar } from './avatars/AnimeAvatar';
import { HostReturnToLobbyButton } from './ui/HostReturnToLobbyButton';

export function RevealPhase() {
  const { socket, gameState, player, isHost } = useGame();
  const [showAnswers, setShowAnswers] = useState(true);
  const [visibleAnswers, setVisibleAnswers] = useState<number[]>([]);
  const [truePrompt, setTruePrompt] = useState<{ textTrue: string; textDecoy: string } | null>(null);
  const [isPlayersMinimized, setIsPlayersMinimized] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  

  const handleNextPhase = () => {
    socket.emit('game:next-phase', { 
      partyCode: gameState.code, 
      phase: 'results' 
    });
  };

  const handleVote = (playerId: string) => {
    if (isSubmittingVote) return; // Prevent double-tap
    
    setIsSubmittingVote(true);
    setSelectedPlayer(playerId);
    socket.emit('vote:submit', { 
      partyCode: gameState.code, 
      accusedPlayerId: playerId 
    });
  };

  const currentRound = gameState.rounds?.[0];
  const responses = currentRound?.responses || [];
  const votes = currentRound?.votes || [];

  // Check if all necessary data is loaded
  useEffect(() => {
    const hasRequiredData = currentRound && responses.length > 0 && gameState.players.length > 0;
    if (hasRequiredData) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // 300ms delay for smooth transition
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [currentRound, responses.length, gameState.players.length]);

  // Also check if true prompt is loaded (for classic mode)
  useEffect(() => {
    if (!isLoading && currentRound && !currentRound.isCustomPrompt && !truePrompt) {
      // For classic mode, we need the true prompt to be loaded
      setIsLoading(true);
    }
  }, [isLoading, currentRound, truePrompt]);

  // Get true prompt when component mounts
  useEffect(() => {
    if (currentRound?.id) {
      socket.emit('prompt:get-true', { roundId: currentRound.id });
    }
  }, [currentRound?.id, socket]);

  // Listen for true prompt response and vote events
  useEffect(() => {
    const handleTruePromptReceived = (data: { textTrue: string; textDecoy: string }) => {
      setTruePrompt(data);
    };

    const handleVoteSubmitted = () => {
      setIsSubmittingVote(false);
    };

    const handleVoteError = (data: { message: string }) => {
      console.error('Vote submission error:', data.message);
      setIsSubmittingVote(false);
      // Optionally show user-friendly error message
    };

    const handlePlayerKicked = (data: { message: string }) => {
      localStorage.removeItem('fibs-party-code');
      localStorage.removeItem('fibs-player-id');
      localStorage.removeItem('fibs-last-disconnect');
      sessionStorage.removeItem('fibs-in-game');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    };

    const handlePartyLeft = (data: { success: boolean }) => {
      if (data.success) {
        localStorage.removeItem('fibs-party-code');
        localStorage.removeItem('fibs-player-id');
        localStorage.removeItem('fibs-last-disconnect');
        sessionStorage.removeItem('fibs-in-game');
        window.location.href = '/';
      }
    };

    const handlePartyState = (data: any) => {
      if (data) {
        // The gameState will be updated by the parent component (game/page.tsx)
      }
    };

    socket.on('prompt:true-received', handleTruePromptReceived);
    socket.on('vote:submitted', handleVoteSubmitted);
    socket.on('error', handleVoteError);
    socket.on('player:kicked', handlePlayerKicked);
    socket.on('party:left', handlePartyLeft);
    socket.on('party:state', handlePartyState);

    return () => {
      socket.off('prompt:true-received', handleTruePromptReceived);
      socket.off('vote:submitted', handleVoteSubmitted);
      socket.off('error', handleVoteError);
      socket.off('player:kicked', handlePlayerKicked);
      socket.off('party:left', handlePartyLeft);
      socket.off('party:state', handlePartyState);
    };
  }, [socket]);

  // Get players with responses for sequential reveal
  const playersWithResponses = gameState.players.filter((p: any) => 
    p.id !== 'NO_LIAR' && 
    p.id !== currentRound?.promptCreatorId && 
    responses.find((r: any) => r.playerId === p.id)
  );


  // Show all answers immediately in voting phase (no staggered reveal needed)
  useEffect(() => {
    if (responses.length > 0) {
      // Show all responses immediately for voting
      const allIndices = responses.map((_: any, index: number) => index);
      setVisibleAnswers(allIndices);
    }
  }, [responses.length]);


  // Voting functionality - only run when round changes
  useEffect(() => {
    const currentRound = gameState.rounds?.[0];
    if (!currentRound || !player) return;

    // Check if player has already voted
    const existingVote = currentRound.votes?.find((v: any) => v.voterId === player.id);
    if (existingVote) {
      setSelectedPlayer(existingVote.accusedPlayerId);
      setIsSubmittingVote(false); // Player has already voted, not submitting
    } else {
      // Reset selection if no existing vote
      setSelectedPlayer(null);
      setIsSubmittingVote(false);
    }
  }, [gameState.rounds?.[0]?.id, player?.id]); // Only depend on round ID and player ID


  // Show loading screen if data isn't ready
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <HostReturnToLobbyButton />
        <div className="max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Reveal Phase...</h2>
            <p className="text-blue-200">Preparing the voting interface</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom CSS for fade animations */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes transitionOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        
        .transition-out {
          animation: transitionOut 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in-normal {
          animation: fadeIn 1s ease-out forwards;
        }
        
      `}</style>
      
      <div className="min-h-screen p-4 flex items-center justify-center">
        <HostReturnToLobbyButton />
      
      <div className="reveal-phase-main-content max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound?.number || 1}</h1>
          <div className="bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-lg px-4 py-2 inline-block">
            <span className="text-white text-sm font-medium">Reveal & Vote Phase</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          {currentRound?.promptCreatorId === player.id && currentRound?.isCustomPrompt ? (
            <p className="text-purple-200 text-lg">
              You created the prompts for this round, so you'll observe as other players vote.
            </p>
          ) : (
            <p className="text-white text-lg">
              Vote for who you think is the Liar.
            </p>
          )}
        </div>


        {/* True Prompt Reveal */}
        {truePrompt && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-400/50 transform transition-all duration-2000 ease-out opacity-100 scale-100 translate-y-0">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-green-300 mb-2">The True Prompt</h3>
                <div className="w-16 h-1 bg-green-400 mx-auto rounded-full"></div>
              </div>
              <p className="text-white text-lg leading-relaxed text-center">
                "{truePrompt.textTrue}"
              </p>
            </div>
          </div>
        )}

        {/* Custom Prompts Display for Prompt Creator */}
        {currentRound?.promptCreatorId === player.id && currentRound?.isCustomPrompt && (
          <div className="mb-8 space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">Your Created Prompts</h3>
            </div>
            
            {/* True Prompt */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-400/50">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-green-300 mb-2">True Prompt</h4>
                  <div className="w-12 h-1 bg-green-400 mx-auto rounded-full"></div>
                </div>
                <p className="text-white text-lg leading-relaxed text-center">
                  "{currentRound?.customPromptTextTrue}"
                </p>
              </div>
            </div>
            
            {/* Decoy Prompt */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-red-400/50">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-red-300 mb-2">Decoy Prompt</h4>
                  <div className="w-12 h-1 bg-red-400 mx-auto rounded-full"></div>
                </div>
                <p className="text-white text-lg leading-relaxed text-center">
                  "{currentRound?.customPromptTextDecoy}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Answers Display for Prompt Creator */}
        {currentRound?.promptCreatorId === player.id && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Player Answers</h3>
              <p className="text-purple-200 text-sm">Watch how players responded to your prompts</p>
              
              {/* Progress Counter for Prompt Creator */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 inline-block mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span className="text-white/70 text-sm">
                    <span className="font-medium text-white">{votes.length}</span> of <span className="font-medium text-white">{gameState.players.filter((p: any) => p.id !== 'NO_LIAR' && p.id !== currentRound.promptCreatorId).length}</span> players have voted
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {gameState.players
                .filter((p: any) => p.id !== 'NO_LIAR' && p.id !== currentRound.promptCreatorId) // Exclude prompt creator
                .map((p: any, index: number) => {
                const playerResponse = responses.find((r: any) => r.playerId === p.id);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-400/30 text-center opacity-100 scale-100 translate-y-0"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <AnimeAvatar type={p.avatar || 'cat'} size="lg" />
                      <span className="font-semibold text-white text-center">
                        {p.nickname}
                      </span>
                      
                      {/* Show player's answer */}
                      {playerResponse && (
                        <div className="text-sm text-purple-200 text-center max-w-full">
                          <div className="break-words" title={playerResponse.text}>
                            "{playerResponse.text}"
                          </div>
                        </div>
                      )}
                      
                      {!playerResponse && (
                        <div className="text-xs text-gray-400 italic">
                          No answer yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

          {/* Voting Section */}
            <div className="mb-8">
            
            {/* Voting Progress - Hidden for prompt creator */}
            {currentRound.promptCreatorId !== player.id && (
              <div className="text-center mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-white/70 text-sm">
                      <span className="font-medium text-white">{votes.length}</span> of <span className="font-medium text-white">{gameState.players.filter((p: any) => p.id !== 'NO_LIAR' && p.id !== currentRound.promptCreatorId).length}</span> players have voted
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Players Grid for Voting - Hidden for prompt creator */}
            {currentRound.promptCreatorId !== player.id && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {gameState.players
                .filter((p: any) => p.id !== 'NO_LIAR' && p.id !== currentRound.promptCreatorId) // Exclude prompt creator
                .map((p: any, index: number) => {
                const isSelected = selectedPlayer === p.id;
                const voteCount = votes.filter((v: any) => v.accusedPlayerId === p.id).length;
                const playerResponse = responses.find((r: any) => r.playerId === p.id);
                const isCurrentPlayer = p.id === player.id;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => !isCurrentPlayer && !isSubmittingVote && handleVote(p.id)}
                    disabled={isCurrentPlayer || isSubmittingVote}
                    className={`p-4 rounded-xl border-2 text-center ${
                      isCurrentPlayer
                        ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/50 cursor-not-allowed opacity-75'
                        : isSubmittingVote
                        ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/50 cursor-not-allowed opacity-75'
                        : isSelected
                        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 scale-105'
                        : 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15 hover:scale-105'
                    } opacity-100 scale-100 translate-y-0`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <AnimeAvatar type={p.avatar || 'cat'} size="lg" />
                      <span className="font-semibold text-white text-center">
                        {p.nickname}
                        {isCurrentPlayer && (
                          <span className="text-blue-300 text-sm font-medium ml-1">(You)</span>
                        )}
                      </span>
                      
                      {/* Show player's answer */}
                      {playerResponse && (
                        <div className="text-xs text-blue-200 text-center max-w-full">
                          <div className="break-words" title={playerResponse.text}>
                            "{playerResponse.text}"
                          </div>
                        </div>
                      )}
                      
                      {isCurrentPlayer && (
                        <div className="bg-blue-500/20 rounded-full px-3 py-1">
                          <span className="text-blue-300 text-sm font-medium">
                            Can't vote for yourself
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              </div>
            )}

            {/* No Liar Option */}
            {currentRound.promptCreatorId !== player.id && (
              <div className="text-center">
                <button
                  onClick={() => !isSubmittingVote && handleVote('NO_LIAR')}
                  disabled={isSubmittingVote}
                  className={`px-6 py-4 rounded-xl border-2 text-center ${
                    isSubmittingVote
                      ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/50 cursor-not-allowed opacity-75'
                      : selectedPlayer === 'NO_LIAR'
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/50 scale-105'
                      : 'bg-white/10 border-white/20 hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedPlayer === 'NO_LIAR'
                        ? 'bg-emerald-500'
                        : 'bg-slate-500 group-hover:bg-emerald-500'
                    }`}>
                      <svg 
                        className="w-4 h-4 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2.5} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                    </div>
                    
                    {/* Text */}
                    <div className="text-left">
                      <div className={`font-semibold text-white ${
                        selectedPlayer === 'NO_LIAR' ? 'text-emerald-100' : 'text-white'
                      }`}>
                        Everyone Told the Truth
                      </div>
                      <div className={`text-xs text-white/70 ${
                        selectedPlayer === 'NO_LIAR' ? 'text-emerald-200' : 'text-white/70'
                      }`}>
                        No one is lying this round
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

        {/* Players - Only visible to host */}
        {isHost && (
          <div className="mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg p-2"
              onClick={() => setIsPlayersMinimized(!isPlayersMinimized)}
            >
              <h3 className="text-lg font-semibold text-white">Players</h3>
              <div className="text-white">
                {isPlayersMinimized ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </div>
            {!isPlayersMinimized && (
              <div className="mt-3">
                <PlayerList showKickButtons={true} />
              </div>
            )}
          </div>
        )}

        {/* Host Controls */}
        {!isHost && (
          <div className="text-center">
            <p className="text-blue-200">Waiting for host to end voting...</p>
          </div>
        )}

        {/* Host Controls */}
        {isHost && (
          <div className="text-center mt-8">
            <button
              onClick={handleNextPhase}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg"
            >
              Advance to Results Phase
            </button>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

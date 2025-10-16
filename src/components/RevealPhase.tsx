'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { PlayerList } from './PlayerList';
import { AnimeAvatar } from './avatars/AnimeAvatar';
import { HostReturnToLobbyButton } from './ui/HostReturnToLobbyButton';

export function RevealPhase() {
  const { socket, gameState, player, isHost } = useGame();
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTruePrompt, setShowTruePrompt] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState<number[]>([]);
  const [truePrompt, setTruePrompt] = useState<{ textTrue: string; textDecoy: string } | null>(null);
  const [isPlayersMinimized, setIsPlayersMinimized] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const handleNextPhase = () => {
    socket.emit('game:next-phase', { 
      partyCode: gameState.code, 
      phase: 'results' 
    });
  };

  const handleVote = (playerId: string) => {
    if (isSubmittingVote) return; // Prevent double-tap
    
    // Don't do anything if clicking the same player again
    if (selectedPlayer === playerId) return;
    
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

  // Start the reveal sequence when component mounts
  useEffect(() => {
    const startAnswerReveal = () => {
      responses.forEach((_: any, index: number) => {
        setTimeout(() => {
          setVisibleAnswers(prev => [...prev, index]);
        }, index * 1500); // Slower reveal - 1.5 seconds between each answer
      });

      // Show true prompt after all answers are revealed
      setTimeout(() => {
        setShowTruePrompt(true);
      }, responses.length * 1500 + 2000); // 2 seconds after last answer
    };

    const timer = setTimeout(() => {
      setShowAnswers(true);
      startAnswerReveal();
    }, 1000); // Start after 1 second

    return () => clearTimeout(timer);
  }, [responses.length]);

  // Voting functionality
  useEffect(() => {
    const currentRound = gameState.rounds?.[0];
    if (!currentRound) return;

    // Check if player has already voted
    const existingVote = currentRound.votes?.find((v: any) => v.voterId === player.id);
    if (existingVote) {
      setSelectedPlayer(existingVote.accusedPlayerId);
      setIsSubmittingVote(false); // Player has already voted, not submitting
    }
  }, [gameState, player]);


  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <HostReturnToLobbyButton />
      <div className="max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound?.number || 1}</h1>
          <div className="bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-lg px-4 py-2 inline-block">
            <span className="text-white text-sm font-medium">Reveal & Vote Phase</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          {!showAnswers && (
            <div className="animate-pulse">
              <p className="text-white text-lg">Preparing the reveal...</p>
            </div>
          )}
          {showAnswers && (
            <p className="text-white text-lg">
              Read everyone's answers and vote for who you think is the Liar.
            </p>
          )}
        </div>


        {/* True Prompt Reveal */}
        {showTruePrompt && truePrompt && (
          <div className="mb-8 animate-fade-in">
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

          {/* Voting Section */}
          {showAnswers && (
            <div className="mb-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Who is the Liar?</h3>
                <p className="text-blue-200 mb-3">Click on a player to vote for them, or choose "No Liar" if you think everyone told the truth</p>
                
                {/* Voting Progress */}
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg p-3 border border-blue-400/20 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-200 text-sm">
                      <span className="font-semibold text-white">{votes.length}</span> of <span className="font-semibold text-white">{gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length}</span> players have voted
                    </span>
                  </div>
                </div>
              </div>
            
            {/* Players Grid for Voting */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {gameState.players
                .map((p: any, index: number) => {
                const isSelected = selectedPlayer === p.id;
                const voteCount = votes.filter((v: any) => v.accusedPlayerId === p.id).length;
                const playerResponse = responses.find((r: any) => r.playerId === p.id);
                const isVisible = visibleAnswers.includes(index);
                const isCurrentPlayer = p.id === player.id;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => !isCurrentPlayer && !isSubmittingVote && handleVote(p.id)}
                    disabled={isCurrentPlayer || isSubmittingVote}
                    className={`p-4 rounded-xl border-2 transition-all duration-2000 ease-out transform text-center ${
                      isCurrentPlayer
                        ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/50 cursor-not-allowed opacity-75'
                        : isSubmittingVote
                        ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/50 cursor-not-allowed opacity-75'
                        : isSelected
                        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 scale-105'
                        : 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15 hover:scale-105'
                    } ${
                      isVisible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-8'
                    }`}
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
                          <div className="truncate" title={playerResponse.text}>
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

            {/* No Liar Option */}
            <div className="text-center">
              <button
                onClick={() => !isSubmittingVote && handleVote('NO_LIAR')}
                disabled={isSubmittingVote}
                className={`px-8 py-4 rounded-xl border-2 transition-all duration-200 ${
                  isSubmittingVote
                    ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/50 cursor-not-allowed opacity-75'
                    : selectedPlayer === 'NO_LIAR'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 scale-105'
                    : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/50 hover:border-blue-400/70 hover:bg-blue-500/30 hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-lg">
                    No Liar - Everyone Told the Truth
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Players - Only visible to host */}
        {isHost && (
          <div className="mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-all duration-200"
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
        {!isHost && showTruePrompt && (
          <div className="text-center">
            <p className="text-blue-200">Waiting for host to start voting...</p>
          </div>
        )}

        {/* Host Controls */}
        {isHost && showTruePrompt && (
          <div className="text-center mt-8">
            <button
              onClick={handleNextPhase}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
            >
              Advance to Results Phase
            </button>
          </div>
        )}

        {!showTruePrompt && (
          <div className="text-center">
            <p className="text-blue-200">Preparing the big reveal...</p>
          </div>
        )}
      </div>
    </div>
  );
}

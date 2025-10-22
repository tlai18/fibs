'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { AnimeAvatar } from './avatars/AnimeAvatar';

export function SequentialRevealPhase() {
  const { socket, gameState, isHost } = useGame();
  
  // Sequential reveal states
  const [isSequentialRevealing, setIsSequentialRevealing] = useState(false);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [revealComplete, setRevealComplete] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  const currentRound = gameState?.rounds?.[0];
  const responses = currentRound?.responses || [];
  
  // Get players with responses for sequential reveal
  const playersWithResponses = gameState?.players?.filter((p: any) => 
    p.id !== 'NO_LIAR' && 
    p.id !== currentRound?.promptCreatorId && 
    responses.find((r: any) => r.playerId === p.id)
  ) || [];

  // Listen for synchronized reveal events from server
  useEffect(() => {
    const handleSequenceStarted = (data: any) => {
      setIsSequentialRevealing(true);
      setCurrentRevealIndex(0);
      setRevealComplete(false);
    };

    const handleResponseShown = (data: any) => {
      setCurrentRevealIndex(data.index);
    };

    const handleSequenceEnded = (data: any) => {
      setRevealComplete(true);
      setIsSequentialRevealing(false);
      
      // Start transition out
      setIsTransitioningOut(true);
      // After transition animation, complete the reveal
      setTimeout(() => {
        setRevealComplete(true);
        setIsTransitioningOut(false);
        // Only the host should transition back to reveal phase
        if (isHost) {
          socket.emit('game:next-phase', { 
            partyCode: gameState.code, 
            phase: 'reveal' 
          });
        }
      }, 1000); // 1 second transition out
    };

    socket.on('reveal:sequence-started', handleSequenceStarted);
    socket.on('reveal:response-shown', handleResponseShown);
    socket.on('reveal:sequence-ended', handleSequenceEnded);

    return () => {
      socket.off('reveal:sequence-started', handleSequenceStarted);
      socket.off('reveal:response-shown', handleResponseShown);
      socket.off('reveal:sequence-ended', handleSequenceEnded);
    };
  }, [socket, gameState.code]);

  // Start synchronized reveal with client-side fallback (only for host)
  useEffect(() => {
    if (isHost && playersWithResponses.length > 0 && !isSequentialRevealing && !revealComplete) {
      // Check if we've already tried to start the reveal for this round
      const roundId = currentRound?.id;
      if (!roundId) return;
      
      const revealKey = `reveal-attempted-${roundId}`;
      const alreadyAttempted = sessionStorage.getItem(revealKey);
      
      if (!alreadyAttempted) {
        // Mark as attempted and start the sequence with a delay to allow server to set up
        sessionStorage.setItem(revealKey, 'true');
        
        // Add a delay to allow the server to properly set up the sequential-reveal phase
        setTimeout(() => {
          socket.emit('reveal:start-sequence', { partyCode: gameState.code });
        }, 500); // 500ms delay
      }
    }
  }, [isHost, playersWithResponses.length, isSequentialRevealing, revealComplete, gameState.code, socket, currentRound?.id]);

  if (!isSequentialRevealing && !isTransitioningOut) {
    return null;
  }

  const player = gameState?.players?.find((p: any) => p.id === socket.id); // Assuming socket.id is player.id

  return (
    <>
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
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
      
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
        <div className="max-w-5xl w-full px-8">
          {playersWithResponses.map((p: any, index: number) => {
            const playerResponse = responses.find((r: any) => r.playerId === p.id);
            const isCurrent = index === currentRevealIndex;
            
            // Only render the current response
            if (!isCurrent) return null;
            
            return (
              <div
                key={`${p.id}-${currentRevealIndex}`}
                className="text-center space-y-8 animate-fade-in"
                style={{
                  animation: 'fadeInOut 4s ease-in-out forwards'
                }}
              >
                {/* Header with Round Info */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound?.number || 1}</h1>
                  <div className="bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-lg px-4 py-2 inline-block">
                    <span className="text-white text-sm font-medium">Revealing Answers</span>
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex justify-center space-x-2 mb-8">
                  {playersWithResponses.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-1000 ${
                        idx < currentRevealIndex 
                          ? 'bg-purple-400 scale-110' 
                          : idx === currentRevealIndex
                          ? 'bg-white scale-125 animate-pulse'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Player Avatar and Name */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <AnimeAvatar type={p.avatar || 'cat'} size="xl" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2">{p.nickname}</h2>
                    {p.id === player?.id && (
                      <span className="text-blue-300 text-xl font-medium">(You)</span>
                    )}
                  </div>
                </div>
                
                {/* Response */}
                {playerResponse && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-white/20 mx-auto max-w-4xl">
                    <div className="text-center mb-4">
                      <div className="w-12 h-1 bg-white/40 mx-auto rounded-full mb-4"></div>
                      <h3 className="text-xl font-semibold text-white mb-4">Response</h3>
                    </div>
                    <p className="text-white text-2xl leading-relaxed">
                      "{playerResponse.text}"
                    </p>
                  </div>
                )}
                
                {/* Response Counter */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-white/70 text-sm">
                      {isTransitioningOut ? (
                        <span className="font-medium text-white">Transitioning to voting...</span>
                      ) : (
                        <>
                          <span className="font-medium text-white">{currentRevealIndex + 1}</span> of <span className="font-medium text-white">{playersWithResponses.length}</span> responses revealed
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

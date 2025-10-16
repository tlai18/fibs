'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { PlayerList } from './PlayerList';
import { AnimeAvatar } from './avatars/AnimeAvatar';
import { HostReturnToLobbyButton } from './ui/HostReturnToLobbyButton';

export function ResultsPhase() {
  const { socket, gameState, player, isHost } = useGame();
  const [isPlayersMinimized, setIsPlayersMinimized] = useState(true);

  useEffect(() => {
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

    socket.on('player:kicked', handlePlayerKicked);
    socket.on('party:left', handlePartyLeft);
    socket.on('party:state', handlePartyState);

    return () => {
      socket.off('player:kicked', handlePlayerKicked);
      socket.off('party:left', handlePartyLeft);
      socket.off('party:state', handlePartyState);
    };
  }, [socket]);

  const handleNextRound = () => {
    socket.emit('game:start', { partyCode: gameState.code });
  };

  const currentRound = gameState.rounds?.[0];
  const summary = currentRound?.summary;
  
  if (!summary) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Calculating results...</p>
        </div>
      </div>
    );
  }

  const liarPlayer = currentRound.liarPlayerId 
    ? gameState.players.find((p: any) => p.id === currentRound.liarPlayerId)
    : null;
  const isNoLiarRound = currentRound.liarPlayerId === null;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <HostReturnToLobbyButton />
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound?.number || 1}</h1>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg px-4 py-2 inline-block">
            <span className="text-white text-sm font-medium">Results Phase</span>
          </div>
        </div>
        
        {/* Result Summary */}
        <div className="mb-12">
          {(() => {
            if (isNoLiarRound) {
              // No Liar round - use server-calculated win type
              if (summary.winType === 'group_win') {
                // Group Win (No Liar)
                return (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl p-12 border border-green-500/30">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h2 className="text-4xl font-bold text-green-400 mb-3">Group Win</h2>
                      <p className="text-lg text-white/80 mb-4">No Liar Round</p>
                      <p className="text-white/90 text-lg">Players correctly identified there was no liar</p>
                    </div>
                  </div>
                );
              } else {
                // Missed No-Liar
                return (
                  <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-3xl p-12 border border-red-500/30">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </div>
                      <h2 className="text-4xl font-bold text-red-400 mb-3">Missed No-Liar</h2>
                      <p className="text-lg text-white/80 mb-4">No Liar Round</p>
                      <p className="text-white/90 text-lg">No majority correctly identified there was no liar</p>
                    </div>
                  </div>
                );
              }
            }

            // Regular round with liar - use server-calculated win type
            if (summary.winType === 'group_win') {
              // Group Win: Majority voted liar
              return (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl p-12 border border-green-500/30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-green-400 mb-3">Group Win</h2>
                    <p className="text-lg text-white/80 mb-6">Liar Caught</p>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <p className="text-white/70 text-sm mb-2">The liar was</p>
                      <p className="text-3xl font-bold text-white">{liarPlayer?.nickname}</p>
                    </div>
                  </div>
                </div>
              );
            } else if (summary.winType === 'perfect_lie') {
              // Perfect Lie: Majority voted "No Liar"
              return (
                <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-3xl p-12 border border-purple-500/30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-purple-400 mb-3">Perfect Lie</h2>
                    <p className="text-lg text-white/80 mb-6">Liar Fooled Everyone</p>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <p className="text-white/70 text-sm mb-2">The liar was</p>
                      <p className="text-3xl font-bold text-white">{liarPlayer?.nickname}</p>
                    </div>
                  </div>
                </div>
              );
            } else if (summary.winType === 'liar_escaped') {
              // Liar Escaped: Avoided majority detection
              return (
                <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl p-12 border border-orange-500/30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-orange-400 mb-3">Liar Escaped</h2>
                    <p className="text-lg text-white/80 mb-6">Split Suspicion</p>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <p className="text-white/70 text-sm mb-2">The liar was</p>
                      <p className="text-3xl font-bold text-white">{liarPlayer?.nickname}</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Fallback
              return (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl p-12 border border-blue-500/30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-blue-400 mb-3">Round Complete</h2>
                    <p className="text-lg text-white/80 mb-6">Check Scores Below</p>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <p className="text-white/70 text-sm mb-2">The liar was</p>
                      <p className="text-3xl font-bold text-white">{liarPlayer?.nickname}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>

        {/* Voting Results Bar Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Voting Results</h3>
          <div className="space-y-3">
            {(() => {
              // Create vote count object with voter information
              const voteCounts: { [key: string]: { count: number; label: string; isLiar: boolean; voters: string[] } } = {};
              
              // Count votes for each player and collect voter names
              if (currentRound.votes && Array.isArray(currentRound.votes)) {
                currentRound.votes.forEach((vote: any) => {
                const voter = gameState.players.find((p: any) => p.id === vote.voterId);
                const voterName = voter ? voter.nickname : 'Unknown';
                
                // Check for "No Liar" votes using the new field
                const isNoLiarVote = vote.isNoLiarVote || 
                                   vote.accusedPlayerId === vote.voterId; // Keep legacy support
                
                if (isNoLiarVote) {
                  if (!voteCounts['NO_LIAR']) {
                    voteCounts['NO_LIAR'] = { count: 0, label: 'No Liar', isLiar: false, voters: [] };
                  }
                  voteCounts['NO_LIAR'].count++;
                  voteCounts['NO_LIAR'].voters.push(voterName);
                } else {
                  const player = gameState.players.find((p: any) => p.id === vote.accusedPlayerId);
                  if (player) {
                    if (!voteCounts[vote.accusedPlayerId]) {
                      voteCounts[vote.accusedPlayerId] = { 
                        count: 0, 
                        label: player.nickname, 
                        isLiar: !isNoLiarRound && vote.accusedPlayerId === currentRound.liarPlayerId,
                        voters: []
                      };
                    }
                    voteCounts[vote.accusedPlayerId].count++;
                    voteCounts[vote.accusedPlayerId].voters.push(voterName);
                  }
                }
              });
              }

              // Sort by vote count (descending)
              const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1].count - a[1].count);
              const maxVotes = Math.max(...sortedVotes.map(([, data]) => data.count), 1);

              return sortedVotes.map(([playerId, data]) => {
                const percentage = (data.count / maxVotes) * 100;
                const isNoLiar = playerId === 'NO_LIAR';
                
                return (
                  <div key={playerId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium flex items-center gap-2">
                        {isNoLiar ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <AnimeAvatar 
                            type={gameState.players.find((p: any) => p.id === playerId)?.avatar || 'cat'} 
                            size="sm" 
                          />
                        )}
                        {data.label}
                        {data.isLiar && (
                          <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-400/30">
                            Liar
                          </span>
                        )}
                      </span>
                      <span className="text-blue-200 font-bold">{data.count} vote{data.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isNoLiar 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : data.isLiar
                            ? 'bg-gradient-to-r from-red-400 to-pink-500'
                            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {/* Show who voted */}
                    <div className="text-xs text-blue-200/70 mt-1">
                      Voted by: {data.voters.join(', ')}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Score Changes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Score Changes</h3>
          <div className="grid gap-2">
            {Object.entries(summary.scoresDelta).map(([playerId, scoreChange]: [string, any]) => {
              // Filter out the NO_LIAR placeholder player
              if (playerId === 'NO_LIAR') return null;
              
              const p = gameState.players.find((player: any) => player.id === playerId);
              return (
                <div
                  key={playerId}
                  className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10"
                >
                  <span className="text-white font-medium">{p?.nickname}</span>
                  <span className={`font-bold ${scoreChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange}
                  </span>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>


        {/* Current Leaderboard */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Scores</h3>
          <div className="space-y-1">
            {gameState.players
              .filter((p: any) => p.id !== 'NO_LIAR') // Filter out the NO_LIAR placeholder
              .sort((a: any, b: any) => b.score - a.score)
              .map((p: any, index: number) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">#{index + 1}</span>
                    <AnimeAvatar type={p.avatar || 'cat'} size="sm" />
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{p.nickname}</span>
                      {p.id === player.id && <span className="text-blue-300 text-xs">(You)</span>}
                    </div>
                  </div>
                  <span className="text-white font-bold">{p.score}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Players - Only visible to host */}
        {isHost && (
          <div className="mb-6">
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
        {isHost && (
          <div className="text-center">
            <button
              onClick={handleNextRound}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Next Round
            </button>
          </div>
        )}

        {!isHost && (
          <div className="text-center">
            <p className="text-white/60 text-sm">Waiting for host to start next round...</p>
          </div>
        )}
      </div>
    </div>
  );
}

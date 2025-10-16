'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { useGameEvents } from '../hooks/useGameEvents';
import { GameContainer } from './ui/GameContainer';
import { PhaseHeader } from './ui/PhaseHeader';
import { GameButton } from './ui/GameButton';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { PlayerList } from './PlayerList';
import { HostReturnToLobbyButton } from './ui/HostReturnToLobbyButton';

export function AnswerPhase() {
  const { socket, gameState, player, isHost } = useGame();
  const [answer, setAnswer] = useState('');
  const [prompt, setPrompt] = useState<{ text: string; role: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Use the modularized hook
  useGameEvents(socket);

  useEffect(() => {
    const currentRound = gameState.rounds?.[0];
    if (!currentRound) {
      return;
    }

    // Get the prompt for this player
    socket.emit('prompt:get', { roundId: currentRound.id, playerId: player.id });
    
    // Check if player has already submitted
    const existingResponse = currentRound.responses?.find((r: any) => r.playerId === player.id);
    if (existingResponse) {
      setAnswer(existingResponse.text);
      setHasSubmitted(true);
    }
  }, [socket, gameState, player]);

  useEffect(() => {
    const handlePromptReceived = (data: { text: string; role: string }) => {
      setPrompt(data);
    };

    const handleAnswerSubmitted = () => {
      setHasSubmitted(true);
      setIsSubmitting(false);
    };

    socket.on('prompt:received', handlePromptReceived);
    socket.on('answer:submitted', handleAnswerSubmitted);

    return () => {
      socket.off('prompt:received', handlePromptReceived);
      socket.off('answer:submitted', handleAnswerSubmitted);
    };
  }, [socket]);

  const handleSubmit = async () => {
    if (!answer.trim() || hasSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit('answer:submit', { 
      partyCode: gameState.code, 
      text: answer.trim() 
    });
  };

  const handleNextPhase = () => {
    socket.emit('game:next-phase', { 
      partyCode: gameState.code, 
      phase: 'reveal' 
    });
  };

  if (!prompt) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your prompt...</p>
        </div>
      </div>
    );
  }

  const currentRound = gameState.rounds?.[0];
  const submittedCount = currentRound?.responses?.length || 0;
  const totalPlayers = gameState.players.filter((p: any) => p.id !== 'NO_LIAR').length;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <HostReturnToLobbyButton />
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound?.number || 1}</h1>
          <div className="bg-blue-500/20 rounded-lg px-4 py-2 inline-block">
            <span className="text-blue-200 text-sm font-medium">Answer Phase</span>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30">
          <h2 className="text-xl font-semibold text-white mb-4">Your Prompt:</h2>
          <p className="text-2xl text-white leading-relaxed">"{prompt.text}"</p>
          {prompt.role === 'liar' && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200 text-sm">
                🎭 You are the Liar! Answer as if you received the true prompt, but be convincing!
              </p>
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-8">
          <label htmlFor="answer" className="block text-lg font-medium text-white mb-3">
            Your Answer:
          </label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            maxLength={200}
            disabled={hasSubmitted}
          />
          <div className="text-right text-sm text-blue-200 mt-1">
            {answer.length}/200 characters
          </div>
        </div>

        {/* Submit Button */}
        {!hasSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
              <p className="text-green-200 font-medium">Answer submitted!</p>
              <p className="text-green-300 text-sm mt-1">Waiting for other players...</p>
            </div>
            {isHost && (
              <button
                onClick={handleNextPhase}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                All Submitted? Continue to Reveal
              </button>
            )}
          </div>
        )}

        {/* Players - Only visible to host */}
        {isHost && (
          <CollapsibleSection title="Players" defaultMinimized={true} className="mt-6">
            <PlayerList showKickButtons={true} />
          </CollapsibleSection>
        )}

        {/* Progress */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            {submittedCount} of {totalPlayers} players have submitted
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(submittedCount / totalPlayers) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

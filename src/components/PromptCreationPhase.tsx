'use client';

import { useState, useEffect } from 'react';
import { useGame } from './GameProvider';
import { HostReturnToLobbyButton } from './ui/HostReturnToLobbyButton';

export function PromptCreationPhase() {
  const { socket, gameState, player } = useGame();
  const [textTrue, setTextTrue] = useState('');
  const [textDecoy, setTextDecoy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [promptCreator, setPromptCreator] = useState<any>(null);

  // Get current round from game state
  const roundFromGameState = gameState?.rounds?.[0];
  const promptCreatorFromRound = roundFromGameState?.promptCreatorId 
    ? gameState?.players?.find((p: any) => p.id === roundFromGameState.promptCreatorId)
    : null;

  useEffect(() => {
    // Listen for prompt creation phase events
    const handlePromptCreationPhase = (data: any) => {
      setCurrentRound(data.round);
      setPromptCreator(data.promptCreator);
    };

    const handlePromptCreated = (data: any) => {
      if (data.success) {
        setCurrentRound(data.round);
      }
    };

    socket.on('prompt:creation-phase', handlePromptCreationPhase);
    socket.on('prompt:created', handlePromptCreated);

    return () => {
      socket.off('prompt:creation-phase', handlePromptCreationPhase);
      socket.off('prompt:created', handlePromptCreated);
    };
  }, [socket]);

  // Use game state data as primary source, fallback to local state
  const currentRoundData = currentRound || roundFromGameState;
  const currentPromptCreator = promptCreator || promptCreatorFromRound;
  const isCurrentCreator = currentPromptCreator && player && currentPromptCreator.id === player.id;

  const handleSubmitPrompt = async () => {
    if (!textTrue.trim() || !textDecoy.trim()) return;
    
    setIsSubmitting(true);
    socket.emit('prompt:create', {
      partyCode: gameState.code,
      textTrue: textTrue.trim(),
      textDecoy: textDecoy.trim()
    });
  };


  if (!currentRoundData || !currentPromptCreator) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
        <div className="text-white text-xl">Loading prompt creation phase...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden">
      <HostReturnToLobbyButton />
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 relative z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/20 px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">Create Your Prompt</h1>
            <p className="text-purple-200">
              {isCurrentCreator 
                ? "It's your turn to create the prompt for this round!"
                : `Waiting for ${currentPromptCreator.nickname} to create the prompt...`
              }
            </p>
          </div>
        </div>

        <div className="p-8">
          {isCurrentCreator ? (
            <div className="space-y-6">
              {/* True Prompt Input */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  True Prompt (What everyone will answer honestly)
                </label>
                <textarea
                  value={textTrue}
                  onChange={(e) => setTextTrue(e.target.value)}
                  placeholder="e.g., What is your favorite color?"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/50 text-sm mt-1">
                  {textTrue.length}/200
                </div>
              </div>

              {/* Decoy Prompt Input */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Decoy Prompt (What the liar will answer)
                </label>
                <textarea
                  value={textDecoy}
                  onChange={(e) => setTextDecoy(e.target.value)}
                  placeholder="e.g., What is your least favorite color?"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-white/50 text-sm mt-1">
                  {textDecoy.length}/200
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmitPrompt}
                  disabled={!textTrue.trim() || !textDecoy.trim() || isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Prompt...
                    </span>
                  ) : (
                    'Create Prompt & Start Round'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Waiting for Prompt</h2>
              <p className="text-purple-200 text-lg">
                <span className="font-semibold text-purple-300">{currentPromptCreator.nickname}</span> is creating the prompt for this round...
              </p>
              <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                <p className="text-purple-200 text-sm">
                  💡 <strong>Remember:</strong> The prompt creator cannot vote or be voted as the liar this round!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

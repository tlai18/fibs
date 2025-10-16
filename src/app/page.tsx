'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarSelector } from '../components/AvatarSelector';
import { HowToPlay } from '../components/HowToPlay';
import { getRandomAvatar } from '../constants/avatars';
import { usePartyManagement } from '../hooks/usePartyManagement';
import { getStoredPartyCode, getStoredPlayerId } from '../utils/storage';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [showReconnectOption, setShowReconnectOption] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('cat'); // Default, will be randomized on client
  const router = useRouter();
  
  // Use the party management hook
  const {
    isCreating,
    isJoining,
    error,
    createParty,
    joinParty,
    reconnectToParty,
    clearPartyContext,
    setError,
    hasActiveParty
  } = usePartyManagement();

  // Set random avatar on client side to avoid hydration mismatch
  useEffect(() => {
    setSelectedAvatar(getRandomAvatar());
  }, []);

  // Check if player has an active party and should show reconnection option
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPartyCode = getStoredPartyCode();
      const storedPlayerId = getStoredPlayerId();
      
      // Show reconnection if we have stored party context
      // This ensures that when a user navigates back to home page, 
      // they always see the reconnection option if they have an active party
      if (storedPartyCode && storedPlayerId) {
        setShowReconnectOption(true);
      }
    }
  }, []);

  const handleCreateParty = async () => {
    await createParty(nickname, selectedAvatar);
  };

  const handleJoinParty = async () => {
    await joinParty(nickname, partyCode, selectedAvatar);
  };

  const handleReconnectToParty = () => {
    reconnectToParty();
  };

  const handleClearPartyContext = async () => {
    clearPartyContext();
    setShowReconnectOption(false);
    setNickname('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning={true}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Guess Who's Lying</h1>
          <p className="text-sm text-blue-300 mt-2">Play the ultimate social deduction party game with friends! No download required.</p>
        </div>

        {/* Reconnection Option */}
        {showReconnectOption && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl backdrop-blur-sm">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Continue Your Game?</h3>
              <p className="text-sm text-blue-200">You have an active party waiting for you</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReconnectToParty}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                Rejoin Party
              </button>
              <button
                onClick={handleClearPartyContext}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-white/30"
              >
                Leave Party
              </button>
            </div>
          </div>
        )}

        {/* Only show create/join options if no reconnection needed */}
        {!showReconnectOption && (
          <div className="space-y-6">
            {/* Nickname Input */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-white mb-3">
                Your Nickname
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                maxLength={20}
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <AvatarSelector 
                selectedAvatar={selectedAvatar}
                onAvatarSelect={setSelectedAvatar}
                defaultMinimized={true}
              />
            </div>

            {/* Create Party */}
            <div className="space-y-3">
              <button
                onClick={handleCreateParty}
                disabled={!nickname.trim() || isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create New Party'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-blue-200 font-medium">or</span>
              </div>
            </div>

            {/* Join Party */}
            <div className="space-y-4">
              <label htmlFor="partyCode" className="block text-sm font-medium text-white mb-3">
                Party Code
              </label>
              <input
                type="text"
                id="partyCode"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                placeholder="Enter party code"
                className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-lg font-mono tracking-widest transition-all duration-200 backdrop-blur-sm"
                maxLength={6}
              />
              <button
                onClick={handleJoinParty}
                disabled={!nickname.trim() || !partyCode.trim() || isJoining}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </span>
                ) : (
                  'Join Party'
                )}
              </button>
              
              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Rules */}
        <HowToPlay className="mt-8" />

        {/* SEO Content - Hidden but accessible to search engines */}
        <div className="sr-only">
          <h2>Free Online Social Deduction Games</h2>
          <p>
            Guess Who's Lying is a free online multiplayer social deduction party game perfect for friends and family. 
            Play this exciting deception game with 2-8 players in real-time. No registration or download required - 
            just create a party and start playing instantly. Features include customizable avatars, multiple game modes, 
            and cross-platform compatibility. Perfect for virtual game nights, family gatherings, and social events.
          </p>
          <h3>Best Social Deduction Games Online</h3>
          <p>
            Our game combines the best elements of classic party games like Mafia, Werewolf, and Among Us into a 
            fast-paced, easy-to-learn format. Players take turns being the liar while others try to identify them 
            through clever questioning and observation. With intuitive gameplay and beautiful graphics, it's the 
            ultimate social deduction experience.
          </p>
          <h3>Multiplayer Party Games for Groups</h3>
          <p>
            Whether you're looking for icebreaker games, team building activities, or just fun with friends, 
            Guess Who's Lying delivers engaging gameplay that brings people together. The game supports 
            voice chat integration and works seamlessly across desktop and mobile devices.
          </p>
        </div>
      </div>
    </div>
  );
}

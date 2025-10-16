'use client';

import React, { useState } from 'react';
import { AVATARS } from '../constants/avatars';
import { AnimeAvatar } from './avatars/AnimeAvatar';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (avatar: string) => void;
  className?: string;
  defaultMinimized?: boolean;
}

export function AvatarSelector({ selectedAvatar, onAvatarSelect, className = '', defaultMinimized = false }: AvatarSelectorProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  
  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATARS.length);
    onAvatarSelect(AVATARS[randomIndex]);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Choose Your Avatar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomAvatar}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            title="Random Avatar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isMinimized ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="text-center mb-4">
        <div className="text-sm text-white/60 mb-2">Your Avatar</div>
        <div className="flex justify-center">
          <AnimeAvatar type={selectedAvatar} size="xl" />
        </div>
      </div>

      {/* Avatar Grid */}
      {!isMinimized && (
        <div className="flex justify-center">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-5 mb-4 p-3 sm:p-4 md:p-5 lg:p-5 rounded-lg bg-white/5 border border-white/10 overflow-hidden place-items-center max-w-fit">
          {AVATARS.map((avatarType, index) => (
            <button
              key={index}
              onClick={() => onAvatarSelect(avatarType)}
              className={`p-2 sm:p-2.5 md:p-3 lg:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                selectedAvatar === avatarType 
                  ? 'bg-blue-500/30 border-2 border-blue-400 scale-105' 
                  : 'hover:bg-white/10 border-2 border-transparent hover:border-white/20'
              }`}
            >
              <AnimeAvatar type={avatarType} size="lg" />
            </button>
          ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-blue-300 text-sm">
          30 cute little friends ready to be picked!
        </p>
      </div>
    </div>
  );
}
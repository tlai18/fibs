'use client';

import { useState } from 'react';

interface HowToPlayProps {
  className?: string;
}

export function HowToPlay({ className = '' }: HowToPlayProps) {
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className={`bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-400/20 ${className}`}>
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-indigo-500/5 transition-all duration-200"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-2xl font-bold text-white">
          How to Play
        </h3>
        <div className="text-indigo-300">
          {isMinimized ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </div>
      
      {!isMinimized && (
        <div className="px-6 pb-6">
          {/* Goal */}
          <div className="text-center mb-6">
            <p className="text-white text-sm">
              Find the <span className="text-red-300 font-medium">liar</span>! One player lies, everyone else tells the truth.
            </p>
          </div>

          {/* Game Flow */}
          <div className="mb-6">
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                <span className="text-white text-sm">One player gets fake prompt, others get real one</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                <span className="text-white text-sm">Everyone writes an answer (liar doesn't know yet)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                <span className="text-white text-sm">Discuss and vote for the liar or "No Liar"</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                <span className="text-white text-sm">Points awarded based on results</span>
              </div>
            </div>
          </div>

          {/* Game Modes */}
          <div className="border-t border-white/10 pt-4 mb-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="text-center">
                <h6 className="font-semibold text-blue-300 text-sm mb-1">Classic</h6>
                <p className="text-blue-200 text-xs">Random prompts, everyone plays</p>
              </div>
              <div className="text-center">
                <h6 className="font-semibold text-purple-300 text-sm mb-1">Custom</h6>
                <p className="text-purple-200 text-xs">Players create prompts, creator sits out</p>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="border-t border-white/10 pt-4">
            <div className="text-center mb-3">
              <h6 className="font-semibold text-white text-sm">Scoring</h6>
            </div>
            <div className="grid gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-green-200">Group catches liar</span>
                <span className="text-white font-medium">+1 each</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-200">Liar escapes</span>
                <span className="text-white font-medium">Liar +2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Perfect lie</span>
                <span className="text-white font-medium">Liar +3</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
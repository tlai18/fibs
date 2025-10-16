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
          {/* Game Flow */}
          <div className="space-y-4 mb-8">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-indigo-300 mb-2">The Game Flow</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Step 1 */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <h5 className="font-semibold text-white">Secret Assignment</h5>
                </div>
                <p className="text-blue-200 text-sm">One player becomes the <span className="text-red-300 font-medium">Liar</span> and gets a fake prompt. Everyone else gets the real prompt.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <h5 className="font-semibold text-white">Answer Phase</h5>
                </div>
                <p className="text-purple-200 text-sm">Everyone writes an answer based on their prompt. <span className="text-yellow-300 font-medium">You don't know yet if you're the Liar!</span></p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <h5 className="font-semibold text-white">Discussion & Vote</h5>
                </div>
                <p className="text-green-200 text-sm">Read all answers, <span className="text-green-300 font-medium">discuss with your group</span>, then vote for who you think is lying, or choose <span className="text-green-300 font-medium">"No Liar"</span> if everyone seems honest.</p>
              </div>

              {/* Step 4 */}
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <h5 className="font-semibold text-white">Results</h5>
                </div>
                <p className="text-orange-200 text-sm">Points are awarded based on who got caught and how well the Liar performed.</p>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="border-t border-indigo-400/30 pt-6">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-indigo-300 mb-2">Scoring System</h4>
              <p className="text-indigo-200 text-sm">How to win points and outsmart your opponents</p>
            </div>
            
            <div className="grid gap-3 md:grid-cols-3">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-400/20 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h6 className="font-semibold text-green-300 text-sm mb-1">Group Win</h6>
                <p className="text-green-200 text-xs">Truth-tellers catch the Liar</p>
                <p className="text-white font-bold text-sm mt-1">+1 each</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg p-3 border border-orange-400/20 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h6 className="font-semibold text-orange-300 text-sm mb-1">Liar Escaped</h6>
                <p className="text-orange-200 text-xs">Liar gets some votes but escapes</p>
                <p className="text-white font-bold text-sm mt-1">Liar +2</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-400/20 text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h6 className="font-semibold text-purple-300 text-sm mb-1">Perfect Lie</h6>
                <p className="text-purple-200 text-xs">Liar fools everyone completely</p>
                <p className="text-white font-bold text-sm mt-1">Liar +3</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

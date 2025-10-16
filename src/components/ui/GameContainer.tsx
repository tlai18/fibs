import React from 'react';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function GameContainer({ children, className = '' }: GameContainerProps) {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className={`max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl ${className}`}>
        {children}
      </div>
    </div>
  );
}

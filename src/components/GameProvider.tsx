'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';

interface GameContextType {
  socket: Socket;
  gameState: any;
  player: any;
  isHost: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ 
  children, 
  socket, 
  gameState, 
  player 
}: { 
  children: ReactNode;
  socket: Socket;
  gameState: any;
  player: any;
}) {
  const isHost = player?.isHost || false;

  // Ensure we have valid values before rendering
  if (!socket || !gameState || !player) {
    return (
      <GameContext.Provider value={{ 
        socket: socket || {} as Socket, 
        gameState: gameState || {}, 
        player: player || {}, 
        isHost: false 
      }}>
        {children}
      </GameContext.Provider>
    );
  }

  return (
    <GameContext.Provider value={{ socket, gameState, player, isHost }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

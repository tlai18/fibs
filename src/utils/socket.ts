// Socket utility functions

import { io, Socket } from 'socket.io-client';

export interface SocketConfig {
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  transports?: string[];
}

export const DEFAULT_SOCKET_CONFIG: SocketConfig = {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
};

/**
 * Create a socket connection with default configuration
 */
export function createSocket(serverUrl?: string): Socket {
  const url = serverUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
  
  return io(url, DEFAULT_SOCKET_CONFIG);
}

/**
 * Create a socket connection with custom configuration
 */
export function createSocketWithConfig(config: SocketConfig, serverUrl?: string): Socket {
  const url = serverUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
  
  return io(url, {
    ...DEFAULT_SOCKET_CONFIG,
    ...config
  });
}

/**
 * Common socket event handlers for cleanup and navigation
 */
export function setupCommonSocketHandlers(
  socket: Socket,
  onNavigateHome: () => void
): () => void {
  const handlePlayerKicked = () => {
    onNavigateHome();
  };

  const handlePartyLeft = (data: { success: boolean }) => {
    if (data.success) {
      onNavigateHome();
    }
  };

  const handleDisconnect = () => {
    // Mark disconnect time
    if (typeof window !== 'undefined') {
      localStorage.setItem('fibs-last-disconnect', Date.now().toString());
      sessionStorage.removeItem('fibs-in-game');
    }
  };

  // Register event listeners
  socket.on('player:kicked', handlePlayerKicked);
  socket.on('party:left', handlePartyLeft);
  socket.on('disconnect', handleDisconnect);

  // Return cleanup function
  return () => {
    socket.off('player:kicked', handlePlayerKicked);
    socket.off('party:left', handlePartyLeft);
    socket.off('disconnect', handleDisconnect);
  };
}

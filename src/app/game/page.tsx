'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { GameProvider } from '@/components/GameProvider';
import { Lobby } from '@/components/Lobby';
import { PromptCreationPhase } from '@/components/PromptCreationPhase';
import { AnswerPhase } from '@/components/AnswerPhase';
import { RevealPhase } from '@/components/RevealPhase';
import { ResultsPhase } from '@/components/ResultsPhase';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { AvatarSelector } from '@/components/AvatarSelector';
import { getRandomAvatar } from '@/constants/avatars';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { getCurrentPhase } from '@/utils/gameState';
import { createSocket } from '@/utils/socket';
import { getStoredNickname, getStoredAvatar, storePartyContext } from '@/utils/storage';
import { canPerformAction } from '@/utils/validation';

function GamePageContent() {
  const searchParams = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsNickname, setNeedsNickname] = useState(false);
  const [joinNickname, setJoinNickname] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('cat'); // Default, will be randomized on client
  const [player, setPlayer] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set random avatar on client side to avoid hydration mismatch
  useEffect(() => {
    setJoinAvatar(getRandomAvatar());
  }, []);

  const handleJoinWithNickname = () => {
    if (!joinNickname.trim() || isJoining) return;
    
    setIsJoining(true);
    setError(null);
    
    // Store nickname and avatar
    localStorage.setItem('fibs-nickname', joinNickname.trim());
    localStorage.setItem('fibs-avatar', joinAvatar);
    
    // Get the party code from URL
    const code = searchParams.get('code');
    if (!code) {
      setError('Party code not found');
      setIsJoining(false);
      return;
    }
    
    // Initialize socket and join directly
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setLoading(false); // Don't set loading to true here, let the join process handle it
      newSocket.emit('party:join', { code, nickname: joinNickname.trim(), avatar: joinAvatar });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Failed to connect to server:', error);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
      setIsJoining(false);
    });

    // Set up event handlers
    setupSocketEventHandlers(newSocket);
  };

  // Pre-fill nickname from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNickname = localStorage.getItem('fibs-nickname');
      if (storedNickname && needsNickname) {
        setJoinNickname(storedNickname);
      }
    }
  }, [needsNickname]);

  // Function to set up socket event handlers
  const setupSocketEventHandlers = (newSocket: Socket) => {
    newSocket.on('party:created', (data) => {
      setPlayer(data.player);
      setGameState(data.party);
      // Store party context for reconnection
      localStorage.setItem('fibs-party-code', data.party.code);
      localStorage.setItem('fibs-player-id', data.player.id);
      // Mark as currently in game session
      sessionStorage.setItem('fibs-in-game', 'true');
      setLoading(false);
    });

        newSocket.on('party:joined', (data) => {
          setPlayer(data.player);
          setGameState(data.party);
          // Store party context for reconnection
          localStorage.setItem('fibs-party-code', data.party.code);
          localStorage.setItem('fibs-player-id', data.player.id);
          // Mark as currently in game session
          sessionStorage.setItem('fibs-in-game', 'true');
          setLoading(false);
          setIsJoining(false);
          setNeedsNickname(false); // Hide the nickname input form
        });

        newSocket.on('party:reconnected', (data) => {
          // Clear the timeout since reconnection succeeded
          if (reconnectionTimeoutRef.current) {
            clearTimeout(reconnectionTimeoutRef.current);
            reconnectionTimeoutRef.current = null;
          }
          
          setPlayer(data.player);
          setGameState(data.party);
          // Mark as currently in game session after reconnection
          sessionStorage.setItem('fibs-in-game', 'true');
          setLoading(false);
          setError(null);
        });

    newSocket.on('party:state', (data) => {
      if (data) {
        setGameState(data);
        if (!player && data.players) {
          // Find current player in the party by stored player ID
          const storedPlayerId = localStorage.getItem('fibs-player-id');
          const currentPlayer = data.players.find((p: any) => p.id === storedPlayerId);
          setPlayer(currentPlayer);
        }
      }
      setLoading(false);
    });

    newSocket.on('round:new', (data) => {
      if (data && data.party) {
        // Update game state with the party that includes the new round
        setGameState(data.party);
      }
    });

    newSocket.on('phase:changed', (data) => {
      if (data && data.party) {
        setGameState(data.party);
      }
    });

        newSocket.on('error', (data) => {
          if (data && data.message) {
            setError(data.message);
            setLoading(false);
            setIsJoining(false);
          }
        });

    newSocket.on('disconnect', () => {
      // Mark disconnect time and clear session
      localStorage.setItem('fibs-last-disconnect', Date.now().toString());
      sessionStorage.removeItem('fibs-in-game');
    });

        newSocket.on('reconnect', () => {
          // Auto-reconnect if we have stored context
          const storedPartyCode = localStorage.getItem('fibs-party-code');
          const storedPlayerId = localStorage.getItem('fibs-player-id');
          if (storedPartyCode && storedPlayerId) {
            newSocket.emit('party:reconnect', { 
              partyCode: storedPartyCode, 
              playerId: storedPlayerId 
            });
          }
        });

      // Handle being kicked from the party
      newSocket.on('player:kicked', (data: { message: string }) => {
        // Clear localStorage and navigate to home immediately
        localStorage.removeItem('fibs-party-code');
        localStorage.removeItem('fibs-player-id');
        localStorage.removeItem('fibs-last-disconnect');
        sessionStorage.removeItem('fibs-in-game');
        // Force immediate redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      });

      // Handle leaving the party
      newSocket.on('party:left', (data: { success: boolean }) => {
        // Clear localStorage and navigate to home immediately
        localStorage.removeItem('fibs-party-code');
        localStorage.removeItem('fibs-player-id');
        localStorage.removeItem('fibs-last-disconnect');
        sessionStorage.removeItem('fibs-in-game');
        // Force immediate redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      });

      // Handle party returning to lobby (when only one player remains)
      newSocket.on('game:returned-to-lobby', (data: { message: string }) => {
        // The party:state event will update the UI to show lobby
      });
  };

  useEffect(() => {
    // Add cleanup on page unload to ensure session storage is cleared
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('fibs-in-game');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if player has been kicked (no party context but trying to access game page)
    if (typeof window !== 'undefined') {
      const storedPartyCode = localStorage.getItem('fibs-party-code');
      const storedPlayerId = localStorage.getItem('fibs-player-id');
      const action = searchParams.get('action');
      const code = searchParams.get('code');
      
      // If no stored party context and not a direct join/create action, redirect to home
      if (!storedPartyCode && !storedPlayerId && !action) {
        window.location.href = '/';
        return;
      }
      
      const nickname = localStorage.getItem('fibs-nickname');
      const avatar = localStorage.getItem('fibs-avatar');

    // Check if we have stored party context for automatic reconnection
    // Priority: Reconnection > URL actions (to prevent creating new parties on refresh)
    
    if (storedPartyCode && storedPlayerId) {
      // Auto-reconnect to existing party (ignore URL action if we have stored context)
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        setLoading(true); // Show loading while reconnecting
        setError(null); // Clear any previous errors
        
        // Clear any existing timeout
        if (reconnectionTimeoutRef.current) {
          clearTimeout(reconnectionTimeoutRef.current);
        }
        
        newSocket.emit('party:reconnect', { 
          partyCode: storedPartyCode, 
          playerId: storedPlayerId 
        });

        // Set a timeout to prevent infinite loading
        reconnectionTimeoutRef.current = setTimeout(() => {
          setError('Reconnection timed out. Please try again.');
          setLoading(false);
        }, 10000); // 10 second timeout
      });

        newSocket.on('connect_error', (error) => {
          console.error('Failed to connect to server:', error);
          // Clear the timeout since connection failed
          if (reconnectionTimeoutRef.current) {
            clearTimeout(reconnectionTimeoutRef.current);
            reconnectionTimeoutRef.current = null;
          }
          setError('Failed to connect to server. Please try again.');
          setLoading(false);
        });

        // Handle reconnection errors (e.g., player was kicked)
        newSocket.on('error', (data: { message: string }) => {
          console.error('Socket error:', data.message);
          // Clear the timeout since we got an error
          if (reconnectionTimeoutRef.current) {
            clearTimeout(reconnectionTimeoutRef.current);
            reconnectionTimeoutRef.current = null;
          }
          
          // If the error indicates the player was removed, clear localStorage and redirect
          if (data.message.includes('removed') || data.message.includes('not found')) {
            localStorage.removeItem('fibs-party-code');
            localStorage.removeItem('fibs-player-id');
            localStorage.removeItem('fibs-last-disconnect');
            sessionStorage.removeItem('fibs-in-game');
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          } else {
            setError(data.message);
            setLoading(false);
          }
        });

      // Set up all the same event handlers for reconnection
      setupSocketEventHandlers(newSocket);
      setSocket(newSocket);
      return;
    }

    if (action === 'join') {
      setNeedsNickname(true);
      setLoading(false);
      return;
    } else if (!nickname) {
      window.location.href = '/';
      return;
    }

    // Check if already in a game session for create/join actions
    if (typeof window !== 'undefined' && (action === 'create' || action === 'join')) {
      const inGameSession = sessionStorage.getItem('fibs-in-game');
      const storedPartyCode = localStorage.getItem('fibs-party-code');
      
      if (inGameSession === 'true' && storedPartyCode) {
        setError(`You are already in party ${storedPartyCode}. Please leave the current party first or refresh the page.`);
        setLoading(false);
        return;
      }
    }

    // Initialize socket connection
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);

      if (action === 'create') {
        newSocket.emit('party:create', { nickname, avatar: avatar || 'cat' });
      } else if (action === 'join' && code) {
        newSocket.emit('party:join', { code, nickname, avatar: avatar || 'cat' });
      }
    });

    // Set up all event handlers
    setupSocketEventHandlers(newSocket);
    setSocket(newSocket);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clear any pending timeout
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current);
        reconnectionTimeoutRef.current = null;
      }
      newSocket.close();
      // Clear session when navigating away (but keep localStorage for reconnection)
      sessionStorage.removeItem('fibs-in-game');
    };
    } // Close the typeof window !== 'undefined' check
  }, [searchParams]);

  const currentPhase = getCurrentPhase(gameState);

  if (needsNickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Join Party</h1>
            <p className="text-blue-200">Enter your nickname to join the party</p>
          </div>
          
          <div className="space-y-6">
            {/* Nickname Input */}
            <div>
              <input
                type="text"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                placeholder="Enter your nickname"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinWithNickname()}
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <AvatarSelector 
                selectedAvatar={joinAvatar}
                onAvatarSelect={setJoinAvatar}
                defaultMinimized={true}
              />
            </div>
            
            <button
              onClick={handleJoinWithNickname}
              disabled={!joinNickname.trim() || isJoining}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
            
            <div className="text-center">
              <p className="text-xs text-blue-300">
                If you get "Nickname already taken", try a different nickname or the host may need to remove inactive players.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={() => window.location.href = '/'} />;
  }

  if (!socket || !gameState || !player) {
    return <LoadingScreen />;
  }

  return (
    <GameProvider socket={socket} gameState={gameState} player={player}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" suppressHydrationWarning={true}>
        {currentPhase === 'lobby' && <Lobby />}
        {currentPhase === 'prompt-creation' && <PromptCreationPhase />}
        {currentPhase === 'answer' && <AnswerPhase />}
        {currentPhase === 'reveal' && <RevealPhase />}
        {currentPhase === 'results' && <ResultsPhase />}
      </div>
    </GameProvider>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}

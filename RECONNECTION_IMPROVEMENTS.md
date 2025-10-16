# Fibs Game - Reconnection Improvements

## Current Issues:
1. **Manual reconnection** - Players must manually rejoin
2. **No automatic retry** - Socket disconnections not handled gracefully
3. **Limited state recovery** - Some UI state lost on reconnection
4. **No offline detection** - No indication when players go offline

## Recommended Improvements:

### 1. Automatic Socket Reconnection
```typescript
// Enhanced socket configuration
const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

// Auto-reconnect with stored credentials
socket.on('reconnect', () => {
  const nickname = localStorage.getItem('fibs-nickname');
  const partyCode = localStorage.getItem('fibs-party-code');
  const playerId = localStorage.getItem('fibs-player-id');
  
  if (partyCode && playerId) {
    socket.emit('party:reconnect', { partyCode, playerId });
  }
});
```

### 2. Enhanced State Management
```typescript
// Store more player context
localStorage.setItem('fibs-party-code', partyCode);
localStorage.setItem('fibs-player-id', player.id);
localStorage.setItem('fibs-last-phase', gameState.currentPhase);

// Recover UI state on reconnection
const lastPhase = localStorage.getItem('fibs-last-phase');
if (lastPhase && lastPhase !== currentPhase) {
  // Show "reconnecting..." message
  // Restore form inputs, selections, etc.
}
```

### 3. Connection Status Indicators
```typescript
// Show connection status to users
const [connectionStatus, setConnectionStatus] = useState('connected');

socket.on('connect', () => setConnectionStatus('connected'));
socket.on('disconnect', () => setConnectionStatus('disconnected'));
socket.on('reconnecting', () => setConnectionStatus('reconnecting'));

// UI component
<div className={`connection-status ${connectionStatus}`}>
  {connectionStatus === 'connected' && '🟢 Connected'}
  {connectionStatus === 'reconnecting' && '🟡 Reconnecting...'}
  {connectionStatus === 'disconnected' && '🔴 Disconnected'}
</div>
```

### 4. Player Presence System
```typescript
// Track online/offline status
interface Player {
  id: string;
  nickname: string;
  isOnline: boolean;
  lastSeen: Date;
  isTyping?: boolean;
}

// Broadcast presence updates
socket.on('player:online', (playerId: string) => {
  updatePlayerStatus(playerId, { isOnline: true });
});

socket.on('player:offline', (playerId: string) => {
  updatePlayerStatus(playerId, { isOnline: false, lastSeen: new Date() });
});
```

### 5. Optimistic Updates with Rollback
```typescript
// Optimistic UI updates
const handleSubmitAnswer = (answer: string) => {
  // Immediately show in UI
  setLocalAnswer(answer);
  setHasSubmitted(true);
  
  // Send to server
  socket.emit('answer:submit', { partyCode, text: answer });
  
  // Rollback on failure
  socket.on('answer:failed', () => {
    setLocalAnswer('');
    setHasSubmitted(false);
    showError('Failed to submit answer');
  });
};
```

### 6. Conflict Resolution
```typescript
// Handle concurrent edits
interface ConflictResolution {
  resolveConflicts: (localState: any, serverState: any) => any;
  lastSyncTimestamp: Date;
  version: number;
}

// Example: If two players submit simultaneously
const resolveAnswerConflict = (local: string, server: string) => {
  // Use server version as source of truth
  return server || local;
};
```

## Advanced Alternatives:

### Option 1: WebRTC + Socket.io Hybrid
- **WebRTC** for direct player-to-player communication
- **Socket.io** for server coordination
- **Benefits**: Lower latency, better for real-time actions
- **Use case**: Fast-paced voting, live chat

### Option 2: Server-Sent Events (SSE)
- **SSE** for one-way server updates
- **WebSocket** for bidirectional communication
- **Benefits**: Better browser compatibility, automatic reconnection
- **Use case**: Status updates, notifications

### Option 3: State Synchronization Libraries
- **Yjs** for collaborative editing
- **ShareDB** for real-time database sync
- **Benefits**: Built-in conflict resolution, offline support
- **Use case**: Complex collaborative features

## Recommended Implementation Priority:

1. **High Priority**: Auto-reconnection + connection status
2. **Medium Priority**: Enhanced state persistence + presence
3. **Low Priority**: Optimistic updates + conflict resolution

## Current System Rating: 7/10
- Works reliably for basic multiplayer
- Good foundation with Socket.io + database
- Needs UX improvements for disconnection handling
- Suitable for party game use case

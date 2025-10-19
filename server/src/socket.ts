import { Server, Socket } from 'socket.io';
import { gameService, promptService } from './server';
import { GameState } from './types/GameState';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Party creation and joining
    socket.on('party:create', async (data: { nickname: string; avatar: string }) => {
      try {
        console.log('Creating party for:', data.nickname, 'socket:', socket.id);
        const result = await gameService.createParty(data.nickname, data.avatar, socket.id);
        console.log('Party created:', result.party.code);
        socket.join(result.party.code);
        socket.emit('party:created', result);
        socket.emit('party:state', result.party);
      } catch (error) {
        console.error('Error creating party:', error);
        socket.emit('error', { message: 'Failed to create party: ' + (error as Error).message });
      }
    });

    socket.on('party:join', async (data: { code: string; nickname: string; avatar: string }) => {
      try {
        console.log('Joining party:', data.code, 'nickname:', data.nickname, 'socket:', socket.id);
        const result = await gameService.joinParty(data.code, data.nickname, data.avatar, socket.id);
        console.log('Successfully joined party:', data.code);
        socket.join(data.code);
        socket.emit('party:joined', result);
        
        // Notify all players in the party
        io.to(data.code).emit('party:state', result.party);
      } catch (error) {
        console.error('Error joining party:', error);
        socket.emit('error', { message: 'Failed to join party: ' + (error as Error).message });
      }
    });

    // Game controls (host only)
    socket.on('game:start', async (data: { partyCode: string; gameMode: 'classic' | 'custom' }) => {
      try {
        console.log('Starting game for party:', data.partyCode, 'mode:', data.gameMode, 'socket:', socket.id);
        const result = await gameService.startNewRound(data.partyCode, socket.id, data.gameMode);
        console.log('Game started successfully for party:', data.partyCode);
        
        if (data.gameMode === 'custom' && result.promptCreator) {
          // Custom mode: Emit prompt creation phase
          io.to(data.partyCode).emit('prompt:creation-phase', {
            round: result.round,
            party: result.party,
            promptCreator: result.promptCreator
          });
        } else {
          // Classic mode: Emit round new
          io.to(data.partyCode).emit('round:new', result);
        }
        io.to(data.partyCode).emit('party:state', result.party);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game: ' + (error as Error).message });
      }
    });

    socket.on('game:next-phase', async (data: { partyCode: string; phase: string }) => {
      try {
        const result = await gameService.advancePhase(data.partyCode, data.phase, socket.id);
        io.to(data.partyCode).emit('phase:changed', result);
        io.to(data.partyCode).emit('party:state', result.party);
      } catch (error) {
        socket.emit('error', { message: 'Failed to advance phase' });
      }
    });

    socket.on('game:return-to-lobby', async (data: { partyCode: string }) => {
      try {
        console.log('Received game:return-to-lobby request for party:', data.partyCode);
        const result = await gameService.returnPartyToLobby(data.partyCode);
        if (result) {
          console.log('Successfully returned party to lobby, broadcasting to:', data.partyCode);
          console.log('Broadcasting clean lobby state with rounds:', result.rounds?.length || 0);
          io.to(data.partyCode).emit('party:state', result);
          io.to(data.partyCode).emit('game:returned-to-lobby', { message: 'Host returned party to lobby' });
        } else {
          console.log('Failed to return party to lobby - no result returned');
        }
      } catch (error) {
        console.error('Error in game:return-to-lobby handler:', error);
        socket.emit('error', { message: 'Failed to return to lobby: ' + (error as Error).message });
      }
    });

    // Custom prompt creation
    socket.on('prompt:create', async (data: { partyCode: string; textTrue: string; textDecoy: string }) => {
      try {
        console.log('Creating custom prompt for party:', data.partyCode, 'socket:', socket.id);
        
        // Find the player by socket ID
        const player = await gameService.getPlayerBySocketId(socket.id);
        if (!player) {
          throw new Error('Player not found');
        }
        
        const result = await gameService.createCustomPrompt(data.partyCode, player.id, data.textTrue, data.textDecoy);
        
        // Emit prompt created and move to answer phase
        io.to(data.partyCode).emit('prompt:created', { success: true, round: result.round });
        io.to(data.partyCode).emit('round:new', result);
        io.to(data.partyCode).emit('party:state', result.party);
      } catch (error) {
        console.error('Error creating custom prompt:', error);
        socket.emit('error', { message: 'Failed to create prompt: ' + (error as Error).message });
      }
    });

    // Player actions
    socket.on('prompt:get', async (data: { roundId: string; playerId: string }) => {
      try {
        console.log('Getting prompt for player:', data.playerId, 'round:', data.roundId);
        const prompt = await promptService.getPromptForPlayer(data.roundId, data.playerId);
        console.log('Sending prompt to player:', prompt);
        socket.emit('prompt:received', prompt);
      } catch (error) {
        console.error('Error getting prompt:', error);
        socket.emit('error', { message: 'Failed to get prompt: ' + (error as Error).message });
      }
    });

    socket.on('prompt:get-true', async (data: { roundId: string }) => {
      try {
        const truePrompt = await promptService.getTruePrompt(data.roundId);
        socket.emit('prompt:true-received', truePrompt);
      } catch (error) {
        socket.emit('error', { message: 'Failed to get true prompt' });
      }
    });

    socket.on('answer:submit', async (data: { partyCode: string; text: string }) => {
      try {
        console.log('Answer submission attempt:', { partyCode: data.partyCode, socketId: socket.id, textLength: data.text.length });
        const result = await gameService.submitAnswer(data.partyCode, socket.id, data.text);
        console.log('Answer submitted successfully:', result.id);
        socket.emit('answer:submitted', result);
        
        // Broadcast updated party state to all players so they see the updated submission count
        const updatedParty = await gameService.getPartyState(data.partyCode);
        io.to(data.partyCode).emit('party:state', updatedParty);
        
        // Check if all players have submitted
        const allSubmitted = await gameService.checkAllAnswersSubmitted(data.partyCode);
        if (allSubmitted) {
          io.to(data.partyCode).emit('all:answered', { partyCode: data.partyCode });
        }
      } catch (error) {
        console.error('Answer submission error:', (error as Error).message, { partyCode: data.partyCode, socketId: socket.id });
        socket.emit('error', { message: 'Failed to submit answer: ' + (error as Error).message });
      }
    });

    socket.on('vote:submit', async (data: { partyCode: string; accusedPlayerId: string }) => {
      try {
        const result = await gameService.submitVote(data.partyCode, socket.id, data.accusedPlayerId);
        socket.emit('vote:submitted', result);
        
        // Broadcast updated party state to all players so they see the updated vote count
        const updatedParty = await gameService.getPartyState(data.partyCode);
        io.to(data.partyCode).emit('party:state', updatedParty);
        
        // Check if all players have voted
        const allVoted = await gameService.checkAllVotesSubmitted(data.partyCode);
        if (allVoted) {
          io.to(data.partyCode).emit('all:voted', { partyCode: data.partyCode });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to submit vote' });
      }
    });

    // Reconnection handling
    socket.on('party:reconnect', async (data: { partyCode: string; playerId: string }) => {
      try {
        console.log('Reconnecting player:', data.playerId, 'to party:', data.partyCode);
        const result = await gameService.reconnectPlayer(data.partyCode, data.playerId, socket.id);
        socket.join(data.partyCode);
        socket.emit('party:reconnected', result);
        console.log('Successfully reconnected player to party');
        
        // Broadcast updated party state to all players in the party
        console.log('Broadcasting reconnection update to party:', data.partyCode);
        console.log('Reconnected player status:', { id: result.player.id, nickname: result.player.nickname, isActive: result.player.isActive });
        io.to(data.partyCode).emit('party:state', result.party);
      } catch (error) {
        console.error('Error reconnecting player:', error);
        socket.emit('error', { message: 'Failed to reconnect: ' + (error as Error).message });
      }
    });

    // Leave party handling
    socket.on('party:leave', async (data: { partyCode: string; playerId: string }) => {
      try {
        console.log('Player leaving party:', data.playerId, 'from party:', data.partyCode);
        
        // Mark this socket as properly leaving to prevent disconnect handler interference
        (socket as any).isLeavingParty = true;
        
        console.log('Calling handleLeaveParty for socket:', socket.id, 'playerId:', data.playerId);
        const partyCode = await gameService.handleLeaveParty(data.playerId);
        console.log('handleLeaveParty returned partyCode:', partyCode);
        
        if (partyCode) {
          socket.leave(partyCode);
          console.log('Player left party, broadcasting updated party state to:', partyCode);
          // Broadcast updated party state to all remaining players
          const updatedParty = await gameService.getPartyState(partyCode);
          console.log('Updated party after leave:', updatedParty.players.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));
          
          // Check if only one player remains - if so, return to lobby (excluding NO_LIAR placeholder)
          const activeRealPlayers = updatedParty.players.filter((p: any) => p.isActive && p.id !== 'NO_LIAR');
          if (activeRealPlayers.length <= 1) {
            console.log('Only one player remaining, returning party to lobby');
            const lobbyResult = await gameService.returnPartyToLobby(partyCode);
            if (lobbyResult) {
              console.log('Broadcasting lobby state:', lobbyResult.players.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));
              io.to(partyCode).emit('party:state', lobbyResult);
              io.to(partyCode).emit('game:returned-to-lobby', { message: 'Party returned to lobby - need at least 2 players to play' });
            }
          } else {
            console.log('Broadcasting updated party state:', updatedParty.players.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive })));
            io.to(partyCode).emit('party:state', updatedParty);
          }
          
          socket.emit('party:left', { success: true });
        } else {
          console.log('handleLeaveParty returned null - player not found or already removed');
          socket.emit('party:left', { success: false, message: 'Player not found' });
        }
      } catch (error) {
        console.error('Error handling party leave:', error);
        socket.emit('error', { message: 'Failed to leave party: ' + (error as Error).message });
      }
    });

    // Kick player handling
    socket.on('party:kick-player', async (data: { partyCode: string; playerIdToKick: string }) => {
      try {
        console.log('Host kicking player:', data.playerIdToKick, 'from party:', data.partyCode, 'host socket:', socket.id);
        const result = await gameService.kickPlayer(data.partyCode, data.playerIdToKick, socket.id);
        console.log('Kick result:', result);
        if (result.success) {
          console.log('Player kicked successfully, broadcasting updated party state');
          // Broadcast updated party state to all remaining players
          const updatedParty = await gameService.getPartyState(data.partyCode);
          
          // Check if only one player remains - if so, return to lobby
          if (updatedParty.players.filter(p => p.isActive).length <= 1) {
            console.log('Only one player remaining, returning party to lobby');
            const lobbyResult = await gameService.returnPartyToLobby(data.partyCode);
            if (lobbyResult) {
              io.to(data.partyCode).emit('party:state', lobbyResult);
              io.to(data.partyCode).emit('game:returned-to-lobby', { message: 'Party returned to lobby - need at least 2 players to play' });
            }
          } else {
            io.to(data.partyCode).emit('party:state', updatedParty);
          }
          
          // Notify the kicked player and remove them from the room
          if (result.kickedPlayerSocketId) {
            io.to(result.kickedPlayerSocketId).emit('player:kicked', { 
              message: 'You have been removed from the party by the host' 
            });
            // Remove the kicked player from the party room
            io.sockets.sockets.get(result.kickedPlayerSocketId)?.leave(data.partyCode);
          }
          
          socket.emit('player:kick-success', { 
            success: true, 
            message: 'Player removed successfully' 
          });
        } else {
          socket.emit('error', { message: result.message });
        }
      } catch (error) {
        console.error('Error handling player kick:', error);
        socket.emit('error', { message: 'Failed to remove player: ' + (error as Error).message });
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      try {
        console.log('Socket disconnected:', socket.id);
        
        // Skip disconnect handling if player properly left the party
        if ((socket as any).isLeavingParty) {
          console.log('Player properly left party, skipping disconnect handling');
          return;
        }
        
        // Handle disconnect (will promote new host if the disconnected player was host)
        const partyCode = await gameService.handleDisconnect(socket.id);
        if (partyCode) {
          console.log('Player disconnected, broadcasting updated party state to:', partyCode);
          // Broadcast updated party state to all remaining players
          const updatedParty = await gameService.getPartyState(partyCode);
          console.log('Broadcasting party:state with players:', updatedParty.players.map((p: any) => ({ id: p.id, nickname: p.nickname, isActive: p.isActive, isHost: p.isHost })));
          io.to(partyCode).emit('party:state', updatedParty);
        } else {
          console.log('Player was already removed or does not exist, skipping disconnect handling');
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

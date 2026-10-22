import { MINIMUM_PLAYERS } from './gameManager.js'

const MAX_CHAT_LENGTH = 500

export function registerSocketHandlers(io, roomManager, gameManager) {
  io.on('connection', (socket) => {
    socket.on('room:create', (payload) => {
      try {
        const { name } = readPayload(payload)
        const result = roomManager.createRoom(name, socket.id)
        socket.data.playerId = result.player.id
        socket.join(result.room.code)
        socket.emit('room:created', {
          code: result.room.code,
          token: result.token,
          playerId: result.player.id
        })
        emitRoomUpdate(io, result.room)
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('room:join', (payload) => {
      try {
        const { code, name } = readPayload(payload)
        const result = roomManager.joinRoom(code, name, socket.id)
        socket.data.playerId = result.player.id
        socket.join(result.room.code)
        socket.emit('room:joined', {
          code: result.room.code,
          token: result.token,
          playerId: result.player.id
        })
        emitRoomUpdate(io, result.room)
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('room:resume', (payload) => {
      try {
        const { token } = readPayload(payload)
        if (typeof token !== 'string') throw new Error('Your game session is missing. Return to the home page and rejoin.')

        const { room, player } = roomManager.resumeSession(token, socket.id)
        socket.data.playerId = player.id
        socket.join(room.code)

        socket.emit('room:resumed', {
          code: room.code,
          playerId: player.id,
          phase: room.phase
        })
        if (room.phase !== 'lobby') {
          socket.emit('game:state', createPublicState(room))
          socket.emit('game:role', { role: player.role })
        } else {
          emitRoomUpdate(io, room)
        }
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('game:start', () => {
      try {
        const { room, player } = getAuthenticatedPlayer(socket, roomManager)
        if (player.id !== room.hostId) throw new Error('Only the host can start the game.')

        roomManager.removeDisconnectedPlayers(room)
        gameManager.start(room)
        for (const roomPlayer of room.players.values()) {
          if (roomPlayer.socketId) {
            io.to(roomPlayer.socketId).emit('game:role', { role: roomPlayer.role })
          }
        }
        io.to(room.code).emit('game:started', createPublicState(room))
        io.to(room.code).emit('game:phase', createPublicState(room))
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('game:vote', (payload) => {
      try {
        const { targetId } = readPayload(payload)
        const { room, player } = getAuthenticatedPlayer(socket, roomManager)
        const result = gameManager.submitVote(room, player, targetId)
        if (!result) {
          socket.emit('game:voteAccepted', { phase: room.phase })
          return
        }

        if (result.phase === 'night') {
          io.to(room.code).emit('game:nightResult', {
            playerId: result.playerId,
            playerName: result.playerName
          })
        } else {
          io.to(room.code).emit('game:dayResult', {
            playerId: result.playerId,
            playerName: result.playerName
          })
          io.to(room.code).emit('game:roleReveal', {
            playerId: result.playerId,
            role: result.role
          })
        }

        if (result.winner) {
          io.to(room.code).emit('game:ended', { winner: result.winner })
        } else {
          io.to(room.code).emit('game:phase', createPublicState(room))
        }
        io.to(room.code).emit('game:state', createPublicState(room))
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('chat:message', (payload) => {
      try {
        const { message } = readPayload(payload)
        const { room, player } = getAuthenticatedPlayer(socket, roomManager)
        if (room.phase !== 'day') throw new Error('Chat is only available during the day.')
        if (!player.alive) throw new Error('Eliminated players cannot use the discussion chat.')
        if (typeof message !== 'string' || !message.trim()) throw new Error('Enter a message before sending.')
        if (message.trim().length > MAX_CHAT_LENGTH) {
          throw new Error(`Messages must be ${MAX_CHAT_LENGTH} characters or fewer.`)
        }

        io.to(room.code).emit('chat:message', {
          playerName: player.name,
          message: message.trim(),
          sentAt: new Date().toISOString()
        })
      } catch (error) {
        emitError(socket, error)
      }
    })

    socket.on('disconnect', () => {
      const player = roomManager.getPlayerForSocket(socket.id)
      if (!player) return

      player.player.socketId = null
      if (player.room.phase === 'lobby') emitRoomUpdate(io, player.room)
    })
  })
}

function getAuthenticatedPlayer(socket, roomManager) {
  const membership = roomManager.getPlayerForSocket(socket.id)
  if (!membership || membership.player.id !== socket.data.playerId) {
    throw new Error('Your player session is not connected. Refresh the page to rejoin.')
  }
  return membership
}

function readPayload(payload) {
  if (payload === undefined) return {}
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('The request was not valid.')
  }
  return payload
}

function createPublicState(room) {
  const eligibleVoters = [...room.players.values()].filter((player) =>
    player.alive && (room.phase !== 'night' || player.role === 'MAFIA')
  )

  return {
    code: room.code,
    phase: room.phase,
    round: room.round,
    winner: room.winner,
    votesSubmitted: room.votes.size,
    votesNeeded: eligibleVoters.length,
    players: [...room.players.values()].map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.id === room.hostId,
      alive: player.alive,
      connected: Boolean(player.socketId)
    }))
  }
}

function emitRoomUpdate(io, room) {
  io.to(room.code).emit('room:update', {
    code: room.code,
    hostId: room.hostId,
    minimumPlayers: MINIMUM_PLAYERS,
    players: [...room.players.values()].map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.id === room.hostId,
      connected: Boolean(player.socketId)
    }))
  })
}

function emitError(socket, error) {
  socket.emit('error', {
    message: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  })
}

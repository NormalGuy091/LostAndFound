import { randomBytes, randomUUID } from 'node:crypto'

const ROOM_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export class RoomManager {
  constructor() {
    this.rooms = new Map()
    this.sessions = new Map()
  }

  createRoom(name, socketId) {
    const playerName = this.validateName(name)
    let code

    do {
      code = Array.from(randomBytes(4), (byte) => ROOM_CODE_CHARACTERS[byte % ROOM_CODE_CHARACTERS.length]).join('')
    } while (this.rooms.has(code))

    const room = {
      code,
      hostId: null,
      players: new Map(),
      phase: 'lobby',
      round: 0,
      votes: new Map(),
      winner: null
    }
    const player = this.addPlayer(room, playerName, socketId)
    room.hostId = player.id
    this.rooms.set(code, room)

    return { room, player, token: this.createSession(player.id) }
  }

  joinRoom(code, name, socketId) {
    const roomCode = typeof code === 'string' ? code.trim().toUpperCase() : ''
    const room = this.rooms.get(roomCode)
    if (!room) throw new Error('That room could not be found.')
    if (room.phase !== 'lobby') throw new Error('This game has already started.')

    const playerName = this.validateName(name)
    if ([...room.players.values()].some((player) => player.name.toLowerCase() === playerName.toLowerCase())) {
      throw new Error('That name is already being used in this room.')
    }

    const player = this.addPlayer(room, playerName, socketId)
    return { room, player, token: this.createSession(player.id) }
  }

  resumeSession(token, socketId) {
    const playerId = this.sessions.get(token)
    if (!playerId) throw new Error('Your game session has expired. Return to the home page and rejoin.')

    const room = this.findRoomForPlayer(playerId)
    const player = room?.players.get(playerId)
    if (!room || !player) {
      this.sessions.delete(token)
      throw new Error('Your room is no longer available. Return to the home page and create or join a room.')
    }

    player.socketId = socketId
    return { room, player }
  }

  removeDisconnectedPlayers(room) {
    for (const [playerId, player] of room.players) {
      if (player.socketId) continue
      room.players.delete(playerId)
      for (const [token, sessionPlayerId] of this.sessions) {
        if (sessionPlayerId === playerId) this.sessions.delete(token)
      }
    }
  }

  getPlayerForSocket(socketId) {
    for (const room of this.rooms.values()) {
      for (const player of room.players.values()) {
        if (player.socketId === socketId) return { room, player }
      }
    }
    return null
  }

  findRoomForPlayer(playerId) {
    return [...this.rooms.values()].find((room) => room.players.has(playerId)) ?? null
  }

  addPlayer(room, name, socketId) {
    const player = {
      id: randomUUID(),
      name,
      role: null,
      alive: true,
      socketId
    }
    room.players.set(player.id, player)
    return player
  }

  createSession(playerId) {
    const token = randomBytes(32).toString('hex')
    this.sessions.set(token, playerId)
    return token
  }

  validateName(name) {
    if (typeof name !== 'string') throw new Error('Enter a display name to continue.')
    const trimmedName = name.trim()
    if (trimmedName.length < 1 || trimmedName.length > 20) {
      throw new Error('Display names must be between 1 and 20 characters.')
    }
    return trimmedName
  }
}

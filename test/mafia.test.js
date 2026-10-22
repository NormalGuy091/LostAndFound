import assert from 'node:assert/strict'
import test from 'node:test'
import { GameManager, MINIMUM_PLAYERS } from '../src/mafia/gameManager.js'
import { RoomManager } from '../src/mafia/roomManager.js'

function createRoom(playerCount = MINIMUM_PLAYERS) {
  const rooms = new RoomManager()
  const { room } = rooms.createRoom('Player 1', 'socket-1')
  for (let index = 2; index <= playerCount; index += 1) {
    rooms.joinRoom(room.code, `Player ${index}`, `socket-${index}`)
  }
  return { room, game: new GameManager() }
}

function setRoles(room, mafiaCount) {
  let mafiasAssigned = 0
  for (const player of room.players.values()) {
    player.role = mafiasAssigned < mafiaCount ? 'MAFIA' : 'CIVILIAN'
    if (player.role === 'MAFIA') mafiasAssigned += 1
  }
  room.phase = 'night'
}

test('creates a unique room with its creator as host', () => {
  const rooms = new RoomManager()
  const first = rooms.createRoom('Host', 'socket-1')
  const second = rooms.createRoom('Another Host', 'socket-2')

  assert.match(first.room.code, /^[A-HJ-NP-Z2-9]{4}$/)
  assert.notEqual(first.room.code, second.room.code)
  assert.equal(first.room.players.get(first.room.hostId).name, 'Host')
})

test('rejects invalid room joins and duplicate player names', () => {
  const rooms = new RoomManager()
  const { room } = rooms.createRoom('Host', 'socket-1')

  assert.throws(() => rooms.joinRoom('NOPE', 'Guest', 'socket-2'), /could not be found/)
  assert.throws(() => rooms.joinRoom(room.code, ' host ', 'socket-2'), /already being used/)
  assert.throws(() => rooms.joinRoom(room.code, '   ', 'socket-2'), /between 1 and 20/)
})

test('starts with a reasonable private role distribution', () => {
  const { room, game } = createRoom(6)
  game.start(room)

  assert.equal(room.phase, 'night')
  assert.equal(room.round, 1)
  assert.equal([...room.players.values()].filter((player) => player.role === 'MAFIA').length, 2)
  assert.equal([...room.players.values()].filter((player) => player.role === 'CIVILIAN').length, 4)
})

test('night votes require a living Mafia member and reject repeat votes', () => {
  const { room, game } = createRoom(6)
  setRoles(room, 2)
  const players = [...room.players.values()]
  const mafias = players.filter((player) => player.role === 'MAFIA')
  const civilian = players.find((player) => player.role === 'CIVILIAN')
  const target = players.find((player) => player !== mafias[0])

  assert.throws(() => game.submitVote(room, civilian, target.id), /Only living Mafia/)
  game.submitVote(room, mafias[0], target.id)
  assert.throws(() => game.submitVote(room, mafias[0], target.id), /already voted/)
})

test('resolves a unanimous night vote and advances to day without a role reveal requirement', () => {
  const { room, game } = createRoom()
  setRoles(room, 1)
  const mafia = [...room.players.values()].find((player) => player.role === 'MAFIA')
  const target = [...room.players.values()].find((player) => player.role === 'CIVILIAN')

  const result = game.submitVote(room, mafia, target.id)

  assert.equal(result.playerId, target.id)
  assert.equal(target.alive, false)
  assert.equal(room.phase, 'day')
  assert.equal(result.winner, undefined)
})

test('a split Mafia vote chooses one of its nominated targets', () => {
  const { room, game } = createRoom(6)
  setRoles(room, 2)
  const players = [...room.players.values()]
  const mafias = players.filter((player) => player.role === 'MAFIA')
  const targets = players.filter((player) => player.role === 'CIVILIAN').slice(0, 2)

  game.submitVote(room, mafias[0], targets[0].id)
  const result = game.submitVote(room, mafias[1], targets[1].id)

  assert.ok(targets.some((target) => target.id === result.playerId))
  assert.equal(room.phase, 'day')
})

test('day-vote ties select a tied nominee and reveal the role in the result', () => {
  const { room, game } = createRoom(4)
  setRoles(room, 1)
  room.phase = 'day'
  room.round = 1
  const players = [...room.players.values()]
  players[0].role = 'CIVILIAN'
  players[1].role = 'CIVILIAN'
  players[2].role = 'MAFIA'
  const targetOne = players[0]
  const targetTwo = players[1]
  const votes = new Map([
    [players[0], targetTwo],
    [players[1], targetOne],
    [players[2], targetOne],
    [players[3], targetTwo]
  ])
  let result
  for (const [voter, target] of votes) {
    result = game.submitVote(room, voter, target.id)
  }

  assert.ok([targetOne.id, targetTwo.id].includes(result.playerId))
  assert.ok(['MAFIA', 'CIVILIAN'].includes(result.role))
  assert.equal(room.phase, 'night')
  assert.equal(room.round, 2)
})

test('checks the civilian and Mafia parity win conditions', () => {
  const { room, game } = createRoom(4)
  setRoles(room, 1)
  const players = [...room.players.values()]
  players.find((player) => player.role === 'MAFIA').alive = false
  assert.equal(game.getWinner(room), 'CIVILIANS')

  const mafia = players.find((player) => player.role === 'MAFIA')
  mafia.alive = true
  const civilians = players.filter((player) => player.role === 'CIVILIAN')
  civilians.slice(1).forEach((player) => {
    player.alive = false
  })
  assert.equal(game.getWinner(room), 'MAFIA')
})

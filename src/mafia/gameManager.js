import { randomInt } from 'node:crypto'

export const MINIMUM_PLAYERS = 4

export class GameManager {
  start(room) {
    if (room.phase !== 'lobby') throw new Error('This game has already started.')
    if ([...room.players.values()].filter((player) => player.socketId).length < MINIMUM_PLAYERS) {
      throw new Error(`At least ${MINIMUM_PLAYERS} connected players are needed to start.`)
    }

    if (room.players.size < MINIMUM_PLAYERS) {
      throw new Error(`At least ${MINIMUM_PLAYERS} players are needed to start.`)
    }

    const players = [...room.players.values()]
    const shuffledPlayers = this.shuffle(players)
    const mafiaCount = Math.max(1, Math.floor(players.length / 3))

    shuffledPlayers.forEach((player, index) => {
      player.role = index < mafiaCount ? 'MAFIA' : 'CIVILIAN'
      player.alive = true
    })

    room.phase = 'night'
    room.round = 1
    room.votes.clear()
  }

  submitVote(room, voter, targetId) {
    if (!['night', 'day'].includes(room.phase)) throw new Error('Voting is not open right now.')
    if (!voter.alive) throw new Error('Eliminated players cannot vote.')
    if (room.votes.has(voter.id)) throw new Error('You have already voted this round.')
    if (room.phase === 'night' && voter.role !== 'MAFIA') {
      throw new Error('Only living Mafia players can vote at night.')
    }
    if (typeof targetId !== 'string') throw new Error('Choose a valid player to vote for.')

    const target = room.players.get(targetId)
    if (!target || !target.alive) throw new Error('That player is not alive in this game.')
    if (target.id === voter.id) throw new Error('You cannot vote for yourself.')

    room.votes.set(voter.id, target.id)
    const eligibleVoters = [...room.players.values()].filter((player) =>
      player.alive && (room.phase !== 'night' || player.role === 'MAFIA')
    )

    if (eligibleVoters.every((player) => room.votes.has(player.id))) {
      return this.resolveVotes(room)
    }
    return null
  }

  resolveVotes(room) {
    const counts = new Map()
    for (const targetId of room.votes.values()) {
      counts.set(targetId, (counts.get(targetId) ?? 0) + 1)
    }

    const highestVoteCount = Math.max(...counts.values())
    const tiedPlayerIds = [...counts.entries()]
      .filter(([, count]) => count === highestVoteCount)
      .map(([playerId]) => playerId)
    const eliminated = room.players.get(tiedPlayerIds[randomInt(tiedPlayerIds.length)])
    eliminated.alive = false

    const result = {
      playerId: eliminated.id,
      playerName: eliminated.name,
      role: eliminated.role,
      phase: room.phase
    }
    room.votes.clear()

    const winner = this.getWinner(room)
    if (winner) {
      room.phase = 'ended'
      room.winner = winner
      return { ...result, winner }
    }

    if (room.phase === 'night') {
      room.phase = 'day'
    } else {
      room.phase = 'night'
      room.round += 1
    }
    return result
  }

  getWinner(room) {
    const livingPlayers = [...room.players.values()].filter((player) => player.alive)
    const mafiaCount = livingPlayers.filter((player) => player.role === 'MAFIA').length
    const civilianCount = livingPlayers.length - mafiaCount

    if (mafiaCount === 0) return 'CIVILIANS'
    if (mafiaCount === civilianCount) return 'MAFIA'
    return null
  }

  shuffle(players) {
    const shuffled = [...players]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const otherIndex = randomInt(index + 1)
      ;[shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]]
    }
    return shuffled
  }
}

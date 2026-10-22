const socket = io()
const sessionToken = localStorage.getItem('mafiaSessionToken')
const errorMessage = document.querySelector('#error-message')
let currentState = null
let ownRole = null
let hasVoted = false

if (!sessionToken) window.location.replace('/')

socket.on('connect', () => {
  socket.emit('room:resume', { token: sessionToken })
})

socket.on('room:resumed', ({ phase }) => {
  if (phase === 'lobby') window.location.replace('/lobby.html')
})

socket.on('game:state', (state) => {
  currentState = state
  renderState()
})

socket.on('game:role', ({ role }) => {
  ownRole = role
  const roleCard = document.querySelector('#role-card')
  roleCard.hidden = false
  roleCard.innerHTML = `YOUR ROLE <strong>${role}</strong>`
})

socket.on('game:phase', (state) => {
  currentState = state
  hasVoted = false
  renderState()
})

socket.on('game:voteAccepted', () => {
  hasVoted = true
  renderVoting()
})

socket.on('game:nightResult', ({ playerName }) => {
  addAnnouncement(`${playerName} was killed during the night.`)
})

socket.on('game:dayResult', ({ playerName }) => {
  addAnnouncement(`${playerName} was eliminated by the vote.`)
})

socket.on('game:roleReveal', ({ playerId, role }) => {
  const player = currentState?.players.find((entry) => entry.id === playerId)
  if (player) addAnnouncement(`${player.name} was ${role}.`)
})

socket.on('game:ended', ({ winner }) => {
  showWinner(winner)
})

socket.on('chat:message', ({ playerName, message, sentAt }) => {
  const item = document.createElement('p')
  item.className = 'chat-message'
  const time = new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  item.textContent = `${time} ${playerName}: ${message}`
  const messages = document.querySelector('#chat-messages')
  messages.append(item)
  messages.scrollTop = messages.scrollHeight
})

socket.on('error', ({ message }) => {
  errorMessage.textContent = message
})

document.querySelector('#chat-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const input = document.querySelector('#chat-input')
  if (!input.value.trim()) return
  socket.emit('chat:message', { message: input.value })
  input.value = ''
})

function renderState() {
  if (!currentState) return

  document.querySelector('#room-label').textContent = `ROOM ${currentState.code}`
  document.querySelector('#round-label').textContent = `ROUND ${currentState.round}`
  document.querySelector('#phase-title').textContent = currentState.phase === 'night'
    ? 'The night is young.'
    : currentState.phase === 'day'
      ? 'The city wakes.'
      : 'The game has ended.'
  document.querySelector('#phase-description').textContent = currentState.phase === 'night'
    ? 'The Mafia are choosing their target.'
    : currentState.phase === 'day'
      ? 'Discuss what happened, then vote to eliminate a suspect.'
      : 'The city has chosen its fate.'
  const ownPlayer = currentState.players.find((player) => player.id === currentPlayerId)
  document.querySelector('#chat-form').hidden =
    currentState.phase !== 'day' || !ownPlayer?.alive || currentState.phase === 'ended'
  if (currentState.winner) showWinner(currentState.winner)

  const list = document.querySelector('#game-player-list')
  list.replaceChildren(...currentState.players.map((player) => {
    const item = document.createElement('li')
    item.className = 'player-row'
    item.textContent = `${player.name} ${player.alive ? '' : '(dead)'}` + (player.isHost ? ' (host)' : '')
    return item
  }))
  renderVoting()
}

function renderVoting() {
  if (!currentState) return

  const votingSection = document.querySelector('#voting-section')
  const voteTargets = document.querySelector('#vote-targets')
  const isVotingPhase = ['night', 'day'].includes(currentState.phase)
  const canVoteAtNight = currentState.phase !== 'night' || ownRole === 'MAFIA'
  const isAlive = currentState.players.some((player) => player.alive && player.id === currentPlayerId)
  const canVote = isVotingPhase && canVoteAtNight && isAlive
  votingSection.hidden = !isVotingPhase || (!canVoteAtNight && currentState.phase === 'night')
  voteTargets.replaceChildren()

  if (!canVote) {
    document.querySelector('#vote-prompt').textContent = currentState.phase === 'night'
      ? 'The Mafia are making their choice.'
      : 'You are eliminated and can no longer vote.'
    return
  }

  document.querySelector('#vote-prompt').textContent =
    currentState.phase === 'night' ? 'Choose a player to target.' : 'Choose a player to eliminate.'
  document.querySelector('#vote-status').textContent = hasVoted
    ? 'Your vote is locked in. Waiting for the others...'
    : `${currentState.votesSubmitted} of ${currentState.votesNeeded} votes submitted.`

  for (const player of currentState.players) {
    if (!player.alive || player.id === currentPlayerId) continue
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'vote-target'
    button.textContent = player.name
    button.disabled = hasVoted
    button.addEventListener('click', () => {
      errorMessage.textContent = ''
      socket.emit('game:vote', { targetId: player.id })
    })
    voteTargets.append(button)
  }
}

let currentPlayerId = null
socket.on('room:resumed', ({ playerId }) => {
  currentPlayerId = playerId
  renderVoting()
})

function addAnnouncement(message) {
  const item = document.createElement('p')
  item.className = 'announcement'
  item.textContent = message
  document.querySelector('#announcements').prepend(item)
}

function showWinner(winner) {
  const banner = document.querySelector('#winner-banner')
  banner.hidden = false
  banner.textContent = winner === 'MAFIA' ? 'The Mafia controls the city.' : 'The city has driven out the Mafia.'
  document.querySelector('#voting-section').hidden = true
  document.querySelector('#chat-form').hidden = true
}

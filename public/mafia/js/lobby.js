const socket = io()
const sessionToken = localStorage.getItem('mafiaSessionToken')
const roomCode = localStorage.getItem('mafiaRoomCode')
const errorMessage = document.querySelector('#error-message')
const startButton = document.querySelector('#start-game')

if (!sessionToken) window.location.replace('/')

document.querySelector('#copy-code').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(roomCode ?? '')
    document.querySelector('#lobby-message').textContent = 'Room code copied.'
  } catch {
    document.querySelector('#lobby-message').textContent = `Share code ${roomCode} with your friends.`
  }
})

startButton.addEventListener('click', () => {
  errorMessage.textContent = ''
  socket.emit('game:start')
})

socket.on('connect', () => {
  socket.emit('room:resume', { token: sessionToken })
})

socket.on('room:resumed', ({ code, phase }) => {
  if (phase !== 'lobby') {
    localStorage.setItem('mafiaRoomCode', code)
    window.location.replace('/game.html')
  }
})

socket.on('room:update', ({ code, hostId, minimumPlayers, players }) => {
  document.querySelector('#room-code').textContent = code
  document.querySelector('#player-count').textContent = `${players.length} players`
  document.querySelector('#player-hint').textContent =
    `${players.length} of ${minimumPlayers} players needed to begin.`

  const currentPlayer = players.find((player) => player.id === socketPlayerId)
  const isHost = currentPlayer?.id === hostId
  startButton.hidden = !isHost
  startButton.disabled = players.length < minimumPlayers
  document.querySelector('#host-hint').textContent = isHost
    ? 'You are the host.'
    : 'Wait for the host to start.'

  const list = document.querySelector('#player-list')
  list.replaceChildren(...players.map((player) => {
    const item = document.createElement('li')
    item.className = 'player-row'
    item.textContent = player.name + (player.isHost ? ' (host)' : '')
    return item
  }))
})

let socketPlayerId = null
socket.on('room:resumed', ({ playerId }) => {
  socketPlayerId = playerId
})

socket.on('game:started', () => {
  window.location.assign('/game.html')
})

socket.on('error', ({ message }) => {
  errorMessage.textContent = message
})

const socket = io()
const errorMessage = document.querySelector('#error-message')

document.querySelector('#create-form').addEventListener('submit', (event) => {
  event.preventDefault()
  errorMessage.textContent = ''
  socket.emit('room:create', { name: document.querySelector('#create-name').value })
})

document.querySelector('#join-form').addEventListener('submit', (event) => {
  event.preventDefault()
  errorMessage.textContent = ''
  socket.emit('room:join', {
    code: document.querySelector('#room-code').value,
    name: document.querySelector('#join-name').value
  })
})

socket.on('room:created', enterRoom)
socket.on('room:joined', enterRoom)
socket.on('error', ({ message }) => {
  errorMessage.textContent = message
})

function enterRoom({ code, token }) {
  localStorage.setItem('mafiaSessionToken', token)
  localStorage.setItem('mafiaRoomCode', code)
  window.location.assign('/lobby.html')
}

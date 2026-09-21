const token = localStorage.getItem('token')

if (!token) {
    window.location.href = '/login'
}



async function logout() {
    localStorage.removeItem('token')
    window.location.reload
}
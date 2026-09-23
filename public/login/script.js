// Variables

const authApiBase = '/auth'
let isLogin = true

async function register() {
    const email = document.getElementById('email-input')
    const password = document.getElementById('password-input')


    const response = await fetch(   authApiBase + '/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "email": email.value,
            "password": password.value
        })
    }) 
    const data = await response.json()
    if (response.status != 200) {
        alert(`Failed to login. Reason: ${data.message}`)
        return 0
    }
    window.location.href = '..'
}
// Variables

const authApiBase = '/auth'


async function register() {
    const email = document.getElementById('email-input')
    const password = document.getElementById('password-input')


    const response = await fetch(authApiBase + '/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "email": email.value,
            "password": password.value
        })
    }) 
    const data = await response.json()
    if (response.status != 200) {
        alert(`Failed to register. Reason: ${data.message}`)
        return
    }
    window.location.href = '..'
}
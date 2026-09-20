// Variables

const token = localStorage.getItem('token')
const authApiBase = '/auth'
let isLogin = true
//Email
let containsAt = false
//Password
let moreThan6 = false
let containsUppercase = false
let containsNumber = false

// HTML Elements

const inputs = document.querySelectorAll('.input')

const rememberMe = document.getElementById('remember-me')
const optionMessage = document.getElementById('option')
const optionButton = document.getElementById('option-btn')
const loginRegisterButton = document.getElementById('login-register-btn')



document.getElementById('option-btn').addEventListener('click', function() {
    change()
})

function change() {
    if (isLogin) {
        isLogin = false
    }
    else {
        isLogin = true
    }
    if (!isLogin) {
        rememberMe.style.display = 'none'
        optionMessage.textContent = 'Already have an account? '
        optionButton.textContent = 'Login'
        loginRegisterButton.textContent = 'Register'
    } else {
        rememberMe.style.display = ''
        optionMessage.textContent = "Don't have an account? "
        optionButton.textContent = 'Register'
        loginRegisterButton.textContent = 'Login'
    }
}

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
    }
    console.log(data)
}
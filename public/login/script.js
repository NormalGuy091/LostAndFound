// Variables

const token = localStorage.getItem('token')
let isLogin = true

// HTML Elements

const inputs = document.querySelectorAll('.input')
let emailVal = document.getElementById('email-input').value
let passwordVal = document.getElementById('password-input').value
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
// Variables
let isLoggedIn = true
const token = localStorage.getItem('token')
const loggedInElements = document.querySelectorAll('.loggedIn')


// Startup Logic
if (!token) {
    isLoggedIn = false
}
isLoggedIn = true
if (!isLoggedIn) {
    loggedInElements.forEach(element => {
        element.style.display = 'none';
    });
}
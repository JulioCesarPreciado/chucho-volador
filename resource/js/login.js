document.querySelector("[submit-login]").addEventListener('click', login, { once: true });
const username = document.querySelector("[input-login]")

function login() {
    localStorage['username'] = username.value
    window.location = 'game.html'   
}
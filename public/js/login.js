import { showElement, hideElement } from "./utils.js"
const register = document.getElementById("register");

register.addEventListener("click", function () {
    document.location.href = "/register";
});

window.localStorage.clear("uuid");

const error = document.getElementById("error");


document.getElementById("login").addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Prepare data to send
    const data = {
        username: username,
        password: password
    };

    //hacer request a la api
    fetch('/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    }).then((response) => {
        if (response.status !== 200) {
            console.log('Hubo un problema al iniciar sesion')
            showElement(error)
            return
        }
        hideElement(error)
        window.location.href = '/'
    })
});
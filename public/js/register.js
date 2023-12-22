const login = document.getElementById('login')
login.addEventListener('click', function () {
    window.location.href = '/login'
})

document.getElementById('register').addEventListener('click', function () {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const data = {
        username: username,
        password: password,
    }
    //hacer la peticion al servidor
    fetch('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        if (response.status !== 200) {
            console.log('Hubo un problema al registrar el usuario')
            return
        }
        window.location.href = '/login'
    })
})

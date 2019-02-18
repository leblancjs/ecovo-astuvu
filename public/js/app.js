window.addEventListener('load', () => {
    let idToken
    let accessToken
    let expiresAt

    let webAuth = new auth0.WebAuth({
        domain: 'ecovo.auth0.com',
        clientID: '8wyjKkx9kgKaYe12h5l6AFo4uFJ3OEdc',
        responseType: 'token id_token',
        scope: 'openid profile email',
        redirectUri: window.location.href
    })

    let loginButton = document.getElementById('btn-login')
    loginButton.addEventListener('click', e => {
        e.preventDefault()
        webAuth.authorize()
    })

    let logoutButton = document.getElementById('btn-logout')
    logoutButton.addEventListener('click', logout)

    let loginStatus = document.querySelector('.container h4')
    let tokenValue = document.querySelector('.container p')

    function handleAuthentication() {
        webAuth.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = ''
                localLogin(authResult)
                loginButton.style.display = 'none'
            } else if (err) {
                console.log(err)
                alert('Erreur : ' + err.error + '. Voir la console pour plus de details.')
            }
            displayButtons()
        })
    }

    function localLogin(authResult) {
        localStorage.setItem('isLoggedIn', 'true')

        expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        )
        accessToken = authResult.accessToken
        idToken = authResult.idToken
    }

    function renewTokens() {
        webAuth.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                localLogin(authResult)
            } else if (err) {
                alert("Pas capable d'obtenir un token | " + err.error + ' : ' + err.error_description + '.')
                logout()
            }
            displayButtons()
        })
    }

    function logout() {
        localStorage.removeItem('isLoggedIn')

        accessToken = ''
        idToken = ''
        expiresAt = 0

        displayButtons()
    }

    function isAuthenticated() {
        let expiration = parseInt(expiresAt) || 0
        return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration
    }

    function displayButtons() {
        if (isAuthenticated()) {
            loginButton.style.display = 'none'
            logoutButton.style.display = 'inline-block'
            loginStatus.innerHTML = "T'as un token!"
            tokenValue.innerHTML = accessToken
        } else {
            loginButton.style.display = 'inline-block'
            logoutButton.style.display = 'none'
            loginStatus.innerHTML = "T'as pas de token."
            tokenValue.innerHTML = ''
        }
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
        renewTokens()
    } else {
        handleAuthentication()
    }
})
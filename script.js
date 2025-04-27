const client_id = 'b4692aa365bc42dca4728cf4fa953080'; // Вставь свой Client ID
const redirect_uri = 'https://karmirshalyan.github.io/spotify-connect/';
// Генерация случайных строк для PKCE
const state = generateRandomString(16);
const code_verifier = generateRandomString(64);
const code_challenge = base64UrlEncode(sha256(code_verifier));

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function base64UrlEncode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buffer).then(hashBuffer => new Uint8Array(hashBuffer));
}

// Шаг 1: Авторизация
function login() {
    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=S256&scope=user-read-playback-state user-modify-playback-state user-read-currently-playing`;
    window.location.href = url;
}

// Шаг 2: Обмен авторизационного кода на токен
function getTokenFromCode(code) {
    const data = {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
        client_id: client_id,
        code_verifier: code_verifier
    };
    
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
    })
    .then(response => response.json())
    .then(data => {
        const access_token = data.access_token;
        document.getElementById('login').style.display = 'none';
        document.getElementById('player').style.display = 'block';
        fetchCurrentlyPlaying(access_token);
    })
    .catch(error => console.error('Error getting token: ', error));
}

// Шаг 3: Получение текущей песни
function fetchCurrentlyPlaying(access_token) {
    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.item) {
            document.getElementById('album-art').src = data.item.album.images[0].url;
            document.getElementById('track-name').textContent = data.item.name;
            document.getElementById('artist-name').textContent = data.item.artists.map(artist => artist.name).join(', ');
        }
    });
}

function togglePlay(access_token) {
    fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + access_token }
    }).catch(() => {
        fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + access_token }
        });
    });
}

function nextTrack(access_token) {
    fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }
    });
}

function previousTrack(access_token) {
    fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }
    });
}

// Проверка на редирект
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        getTokenFromCode(code); // Получаем токен
    } else {
        const access_token = getTokenFromUrl();
        if (access_token) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('player').style.display = 'block';
            setInterval(() => fetchCurrentlyPlaying(access_token), 5000); // обновление каждые 5 секунд
            fetchCurrentlyPlaying(access_token);
        }
    }
}

function getTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

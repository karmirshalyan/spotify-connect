// ==== Настройки Spotify API ====
const client_id = 'ТВОЙ_CLIENT_ID'; // вставь свой Client ID сюда
const redirect_uri = window.location.origin + window.location.pathname; // тот же адрес, что ты введешь в настройках приложения Spotify

// Долгая строка для состояния и PKCE
const state = generateRandomString(16);
const code_verifier = generateRandomString(64);
const code_challenge = base64UrlEncode(sha256(code_verifier));

// Генерация случайных строк для PKCE
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Базовый64 URL энкодинг
function base64UrlEncode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Хэширование с использованием SHA256
function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buffer).then(hashBuffer => new Uint8Array(hashBuffer));
}

// Авторизация
function login() {
    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=S256`;
    window.location.href = url;
}

// Получаем токен после редиректа
function getTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

function fetchCurrentlyPlaying() {
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

function togglePlay() {
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

function nextTrack() {
    fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }
    });
}

function previousTrack() {
    fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }
    });
}

// При загрузке страницы
window.onload = () => {
    access_token = getTokenFromUrl();
    if (access_token) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('player').style.display = 'block';
        setInterval(fetchCurrentlyPlaying, 5000); // обновлять каждые 5 секунд
        fetchCurrentlyPlaying();
    }
}

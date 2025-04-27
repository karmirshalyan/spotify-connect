// ==== Настройки Spotify API ====
const client_id = 'b4692aa365bc42dca4728cf4fa953080'; // вставь свой Client ID сюда
const redirect_uri = '';

const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
];

let access_token = '';

function login() {
    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scopes.join('%20')}`;
    window.location.href = url;
}

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

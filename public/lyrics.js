function getLyrics(artist) {
    if (!artist || artist === '') {
        return;
    }

    document.getElementById('results').innerHTML = 'Loading...';

    fetch('/artist/' + artist)
    .then((blob) => {
        return blob.json();
    })
    .then((res) => {
        console.log(res);
        document.getElementById('results').innerHTML = 'done!';
    })
    ;
}

let artistInput = document.getElementById('artist');
document.getElementById('get_lyrics').addEventListener('click', (e) => {
    getLyrics(artistInput.value);
});

artistInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) { // enter key
        getLyrics(artistInput.value);
    }
});

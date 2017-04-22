var https = require('https');
var cheerio = require('cheerio');

var ACCESS_TOKEN = '';

var frequency_table = [];

module.exports = {
    /**
     * Calls `callback` with all lyrics for an artist
     *
     * @param artist: the artist to search for
     * @param callback: function to call once the lyrics have been retreived
     */
    get: function(artist, callback) {
        artist = artist.toLowerCase().trim();
        artist = artist.replace(/\s+/g, ' ');

        getArtistId(artist, (id) => {
            console.log(`ID: ${id}`);
            getSongURLs(id, artist, (urls) => {
                callback(urls);
                urls.forEach((url) => {
                    getSongLyrics(url, analyzeLyrics);
                });
                console.log('\n\n\n\n\n-------------------- DONE -------------------------\n\n\n\n\n');
            });
        });
    }
};

/**
 * Iterates through every word in the song,
 * adds each word to a frequency table
 */
function analyzeLyrics(lyrics) {
    var words = lyrics.split(/\s+/);

    words.forEach((word) => {
        //console.log(word);
        if (word in frequency_table)
            frequency_table[word]++;
        else
            frequency_table[word] = 1;
    });
}

/**
 * Processes the lyrics. Removes anything between [ ],
 * removes all non-letter characters
 *
 * @param lyrics: a string of lyrics to process
 * @return: the newly processed lyrics
 */
function processLyrics(lyrics) {
    lyrics = lyrics.replace(/\[([^\]]+)]/g, ''); // remove anything between [ ]
    lyrics = lyrics.replace(/[^A-Za-z\s\d]/g, ''); // remove any non letter or whitespace
    return lyrics;
}

/**
 * Given a song url, retrieves the page and scrapes the lyrics
 *
 * @param url: the url of the genius lyric page
 * @param callback: the function to call once the lyrics have been received
 */
function getSongLyrics(url, callback) {
    console.log(`requesting ${url}`);
    https.get(url, (res) => {
        var resStr = '';
        res.on('data', (data) => {
            resStr += data;
        });

        res.on('end', () => {
            console.log(`got lyrics for ${url}`);
            var $ = cheerio.load(resStr);

            var lyrics = processLyrics($('.lyrics > p').text());
            callback(lyrics);
        });
    });
}

/**
 * Given an artist id, calls `callback` with an array of all song URLS for that artist
 *
 * @param id: the artist id to search for
 * @param artist: the artist of the songs
 * @param callback: function to call once the song URLS have been retrieved
 */
function getSongURLs(id, artist, callback) {
    var songURLs = [];
    artist = artist.replace(/\s+/g, '-');
    console.log(artist);
    var getURLs = function(page) {
        page = page || 1;

        callGenius(`/artists/${id}/songs?page=${page}&per_page=50`, (res) => {
            var resStr = '';
            res.on('data', (data) => {
                resStr += data;
            });

            res.on('end', () => {
                var resJson = JSON.parse(resStr);
                if (resJson['meta']['status'] !== 200)
                    return callback(null);


                console.log(artist);
                var artistRegex = new RegExp(artist, 'i');
                resJson['response']['songs'].forEach((song) => {
                    if (/.*lyrics.*/i.test(song.url) && artistRegex.test(song.url))
                        songURLs.push(song.url);
                });

                if (resJson['response']['next_page'])
                    getURLs(resJson['response']['next_page']);
                else
                    callback(songURLs);
            });
        });
    };
    getURLs();
}

/**
 * Given an artist, calls `callback` with the genius ID for that artist
 *
 * @param artist: the artist to search for
 * @param callback: function to call once the artist ID has been retrieved
 */
function getArtistId(artist, callback) {
    var URIArtist = artist.replace(/\s+/g, '_'); /* the artist name to send in the request */
    var resStr = '';

    callGenius('/search?q=' + URIArtist, (res) => {
        res.on('data', (data) => {
            resStr += data;
        });

        res.on('end', () => {
            var resJson = JSON.parse(resStr);

            if (resJson.meta.status !== 200)
                return callback(-1);

            var hits = resJson.response.hits;

            for (var i = 0; i < hits.length; i++) {
                var resArtist = hits[i]['result']['primary_artist'];
                if (resArtist['name'].toLowerCase() === artist) {
                    return callback(resArtist['id']);
                }
            }

            return callback(-1);
        });
    });
}

/**
 * Performs an HTTPS request on the Genius API and calls callback
 *
 * @param path: the path to call the API on
 * @param callback: the function to call on response
 */
function callGenius(path, callback) {
    console.log(`PATH: ${path}`);
    var options = {
        host: 'api.genius.com',
        path: path,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + ACCESS_TOKEN
        }
    };
    https.request(options, callback).end();
}

/* get the access token before doing anything */
require('fs').readFile('token.access', 'utf8', (err, data) => {
    if (err)
        console.log('could not read access token');

    ACCESS_TOKEN = data.trim();
});


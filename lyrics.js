var https = require('https');

var ACCESS_TOKEN = '';

module.exports = {
    /**
     * Calls `callback` with all lyrics for an artist
     *
     * @param artist: the artist to search for
     * @param callback: function to call once the lyrics have been retreived
     */
    get: function(artist, callback) {
        getArtistId(artist, (id) => {
            console.log(`ID: ${id}`);
//            getSongURLS(id, (urls) => {
//                console.log(`URLS: ${urls}`);
//            });
        });
    }
};

/**
 * Given an artist id, calls `callback` with an array of all song URLS for that artist
 *
 * @param id: the artist id to search for
 * @param callback: function to call once the song URLS have been retrieved
 */
function getSongURLs(id, callback) {
    console.log(`id: ${id}`);
}

/**
 * Given an artist, calls `callback` with the genius ID for that artist
 *
 * @param artist: the artist to search for
 * @param callback: function to call once the artist ID has been retrieved
 */
function getArtistId(artist, callback) {
    artist = artist.toLowerCase().trim();
    artist = artist.replace(/\s+/g, ' ');

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


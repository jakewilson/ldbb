var https = require('https');

module.exports = {
    /**
     * Calls `callback` with all lyrics for an artist
     *
     * @param artist: the artist to search for
     * @param token: the genius API access token
     * @param callback: function to call once the lyrics have been retreived
     */
    get: function(artist, token, callback) {
        getArtistId(artist, token, (id) => {
            console.log(`${artist} id: ${id}`);
        });
    }
};

/**
 * Given an artist, calls `callback` with the genius ID for that artist
 *
 * @param artist: the artist to search for
 * @param token: the genius API access token
 * @param callback: function to call once the artist ID has been retrieved
 */
function getArtistId(artist, token, callback) {
    artist = artist.toLowerCase().trim();
    var options = {
        host: 'api.genius.com',
        path: '/search?q=' + artist + '&access_token=' + token,
        method: 'GET'
    };
    var resStr = '';
    https.request(options, (res) => {
        res.on('data', (data) => {
            resStr += data;
        });
        res.on('end', () => {
            var resJson = JSON.parse(resStr);
            console.log(`STATUS: ${resJson.meta.status}`);
            if (resJson.meta.status !== 200)
                return callback(-1);

            var hits = resJson.response.hits;
            var found = false;

            hits.forEach((hit) => {
                var resArtist = hit['result']['primary_artist'];
                if (resArtist['name'].toLowerCase() === artist) {
                    found = true;
                    return callback(resArtist['id']);
                }
            });

            if (!found) // TODO get more songs?
                return callback(-1);
        });
    }).end();
}

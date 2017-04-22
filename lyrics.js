var https = require('https');

module.exports = {
    get: function(artist, token, callback) {
        getArtistId(artist, token, (id) => {
            console.log(`${artist} id: ${id}`);
        });
    }
};

/**
 * Given an artist, calls `callback` with the genius ID for that artist
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

            if (!found)
                return callback(-1);
        });
    }).end();
}

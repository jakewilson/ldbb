var https = require('https');

module.exports = {
    get: function(artist, token, callback) {
        artist = artist.trim();
        var options = {
            host: 'api.genius.com',
            path: '/search?q=' + artist + '&access_token=' + token,
            method: 'GET'
        };
        var resStr = '';
        https.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.on('data', (data) => {
                resStr += data;
            });
            res.on('end', () => {
                callback(resStr.toString());
            });
        }).end();
    }
};

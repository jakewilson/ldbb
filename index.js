var express = require('express');
var app = express();

var fs = require('fs');

var lyrics = require('./lyrics.js');

var accessToken = '';

fs.readFile('token.access', 'utf8', (err, data) => {
    if (err)
        console.log('could not read access token');

    accessToken = data.trim();
});

// serve files in public/
app.use(express.static('public'));

app.get('/artist/*', (req, res) => {
    let artist = req.params[0];

    lyrics.get(artist, accessToken, (data) => {
        res.send(data);
    });
});

app.listen(8080, () => {
    console.log('listening on port 8080...');
});

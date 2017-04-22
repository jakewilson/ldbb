var express = require('express');
var app = express();

var lyrics = require('./lyrics.js');

// serve files in public/
app.use(express.static('public'));

app.get('/artist/*', (req, res) => {
    let artist = req.params[0];

    lyrics.get(artist, (data) => {
        res.send(data);
    });
});

app.listen(8080, () => {
    console.log('listening on port 8080...');
});

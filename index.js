var express = require('express');
var app = express();

var fs = require('fs');
var accessToken = '';

fs.readFile('token.access', 'utf8', (err, data) => {
    if (err)
        console.log('could not read access token');

    accessToken = data;
});

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.listen(8080, () => {
    console.log('listening on port 8080...');
});
